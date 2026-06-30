import { prisma } from "../../prisma.js";

export async function getStudentBalance(studentId: string, schoolId: string) {
  // 1. Get all student fee assignments
  const studentFees = await prisma.studentFee.findMany({
    where: { studentId, schoolId },
  });

  // 2. For each fee, calculate paid amount
  const breakdown = await Promise.all(
    studentFees.map(async (fee) => {
      const payments = await prisma.feePayment.aggregate({
        where: {
          studentId,
          feeId: fee.feeId,
          schoolId,
        },
        _sum: {
          amountPaid: true,
        },
      });

      const paid = payments._sum.amountPaid || 0;

      return {
        feeId: fee.feeId,
        amountDue: fee.amountDue,
        paid,
        balance: fee.amountDue - paid,
      };
    })
  );

  // 3. Compute totals (derived from breakdown)
  const totalFees = breakdown.reduce((sum, f) => sum + f.amountDue, 0);
  const totalPaid = breakdown.reduce((sum, f) => sum + f.paid, 0);

  return {
    totalFees,
    totalPaid,
    balance: totalFees - totalPaid,
    breakdown,
  };
}