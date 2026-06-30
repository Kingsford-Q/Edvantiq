import { prisma } from "../../prisma.js";

export async function createInvoice(studentId: string, schoolId: string) {
  const studentFees = await prisma.studentFee.findMany({
    where: { studentId, schoolId },
  });

  const totalAmount = studentFees.reduce(
    (sum, f) => sum + f.amountDue,
    0
  );

  // check payments already made
  const payments = await prisma.feePayment.findMany({
    where: { studentId, schoolId },
  });

  const totalPaid = payments.reduce(
    (sum, p) => sum + p.amountPaid,
    0
  );

  let status: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";

  if (totalPaid === 0) {
    status = "UNPAID";
  } else if (totalPaid < totalAmount) {
    status = "PARTIAL";
  } else {
    status = "PAID";
  }

  const invoice = await prisma.invoice.create({
    data: {
      studentId,
      schoolId,
      totalAmount,
      status,
      InvoiceItem: {
        create: studentFees.map((f) => ({
          feeId: f.feeId,
          amount: f.amountDue,
        })),
      },
    },
    include: { InvoiceItem: true },
  });

  return {
    invoice,
    totalPaid,
    balance: totalAmount - totalPaid,
  };
}