import { prisma } from "../../prisma.js";

export async function createFeePayment(data: {
  studentId: string;
  feeId: string;
  amountPaid: number;
  method: string;
  schoolId: string;
}) {
  // 1. Create payment
  const payment = await prisma.feePayment.create({
    data,
  });

  // 2. Find invoice for student
  const invoice = await prisma.invoice.findFirst({
    where: {
      studentId: data.studentId,
      schoolId: data.schoolId,
    },
  });

  if (!invoice) {
    return payment; // no invoice yet, just return
  }

  // 3. Recalculate total paid
  const totalPaidAgg = await prisma.feePayment.aggregate({
    where: {
      studentId: data.studentId,
      schoolId: data.schoolId,
    },
    _sum: {
      amountPaid: true,
    },
  });

  const totalPaid = totalPaidAgg._sum.amountPaid || 0;

  // 4. Determine status
  let status: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";

  if (totalPaid === 0) {
    status = "UNPAID";
  } else if (totalPaid < invoice.totalAmount) {
    status = "PARTIAL";
  } else {
    status = "PAID";
  }

  // 5. Update invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status,
    },
  });

  return {
    payment,
    invoiceStatus: status,
    totalPaid,
  };
}