import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";
import { createFeePayment } from "./payment.service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function createFeeStructureController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const fee = await prisma.feeStructure.create({
      data: {
        title: req.body.title,
        amount: req.body.amount,
        term: req.body.term,
        classId: req.body.classId,
        schoolId,
        academicYearId: req.body.academicYearId,
      },
    });

    return res.status(201).json(fee);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getFeeStructuresController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const feeStructures = await prisma.feeStructure.findMany({
      where: { schoolId },
      include: {
        class: true,
        payments: true,
        studentFees: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(feeStructures);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getFeeStructureController(req: Request, res: Response) {
  try {
    const feeId = Array.isArray(req.params.feeId)
      ? req.params.feeId[0]
      : req.params.feeId;
    const schoolId = (req as any).schoolId;

    const feeStructure = await prisma.feeStructure.findFirst({
      where: {
        id: feeId,
        schoolId,
      },
      include: {
        class: true,
        payments: {
          include: {
            student: true,
          },
        },
        studentFees: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!feeStructure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    return res.status(200).json(feeStructure);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function updateFeeStructureController(req: Request, res: Response) {
  try {
    const feeId = Array.isArray(req.params.feeId)
      ? req.params.feeId[0]
      : req.params.feeId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.feeStructure.updateMany({
      where: { id: feeId, schoolId },
      data: sanitizeUpdate(req.body),
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    const updated = await prisma.feeStructure.findUnique({ where: { id: feeId } });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function deleteFeeStructureController(req: Request, res: Response) {
  try {
    const feeId = Array.isArray(req.params.feeId)
      ? req.params.feeId[0]
      : req.params.feeId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.feeStructure.deleteMany({
      where: { id: feeId, schoolId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    return res.status(200).json({
      message: "Fee structure deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function createFeePaymentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const { studentId, feeId, amountPaid, method } = req.body;

    if (typeof amountPaid !== "number" || amountPaid <= 0) {
      return res.status(400).json({ message: "amountPaid must be a positive number" });
    }

    if (typeof method !== "string" || !method.trim()) {
      return res.status(400).json({ message: "method is required" });
    }

    const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feeStructure = await prisma.feeStructure.findFirst({ where: { id: feeId, schoolId } });
    if (!feeStructure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    const payment = await createFeePayment({ studentId, feeId, amountPaid, method, schoolId });

    return res.status(201).json(payment);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getFeePaymentsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const payments = await prisma.feePayment.findMany({
      where: { schoolId },
      include: {
        student: true,
        fee: true,
      },
      orderBy: { date: "desc" },
    });

    return res.status(200).json(payments);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getStudentBalanceController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    let studentId = req.params.studentId;
    if (Array.isArray(studentId)) studentId = studentId[0];

    const studentFees = await prisma.studentFee.findMany({
      where: { studentId, schoolId },
    });

    const totalFees = studentFees.reduce(
      (sum, f) => sum + f.amountDue,
      0
    );

    const payments = await prisma.feePayment.findMany({
      where: { studentId, schoolId },
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + p.amountPaid,
      0
    );

    return res.status(200).json({
      totalFees,
      totalPaid,
      balance: totalFees - totalPaid,
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function createInvoiceController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    let studentId = req.params.studentId;
    if (Array.isArray(studentId)) studentId = studentId[0];

    const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentFees = await prisma.studentFee.findMany({
      where: { studentId, schoolId },
    });

    const totalAmount = studentFees.reduce(
      (sum, f) => sum + f.amountDue,
      0
    );

    const payments = await prisma.feePayment.findMany({
      where: { studentId, schoolId },
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + p.amountPaid,
      0
    );

    let status: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";

    if (totalPaid === 0) status = "UNPAID";
    else if (totalPaid < totalAmount) status = "PARTIAL";
    else status = "PAID";

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
      include: {
        InvoiceItem: true,
      },
    });

    return res.status(201).json({
      ...invoice,
      paidAmount: Math.min(totalPaid, totalAmount),
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

/**
 * Invoices don't store a paid amount directly (payments aren't tied to a
 * specific invoice in the schema) — derive it from the student's total
 * FeePayment sum, capped at the invoice total, so the frontend can render
 * paid/balance without doing this math itself.
 */
async function withPaidAmount<T extends { studentId: string; totalAmount: number }>(
  invoices: T[],
  schoolId: string
) {
  const studentIds = [...new Set(invoices.map((i) => i.studentId))];

  const sums = await prisma.feePayment.groupBy({
    by: ["studentId"],
    where: { studentId: { in: studentIds }, schoolId },
    _sum: { amountPaid: true },
  });

  const totalPaidByStudent = new Map(sums.map((s) => [s.studentId, s._sum.amountPaid || 0]));

  return invoices.map((invoice) => ({
    ...invoice,
    paidAmount: Math.min(totalPaidByStudent.get(invoice.studentId) || 0, invoice.totalAmount),
  }));
}

export async function getInvoicesController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const invoices = await prisma.invoice.findMany({
      where: { schoolId },
      include: {
        student: true,
        InvoiceItem: true,
      },
    });

    return res.status(200).json(await withPaidAmount(invoices, schoolId));
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getInvoiceController(req: Request, res: Response) {
  try {
    let { invoiceId } = req.params;
    const schoolId = (req as any).schoolId;

    if (Array.isArray(invoiceId)) {
      invoiceId = invoiceId[0];
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        schoolId,
      },
      include: {
        student: true,
        InvoiceItem: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const [withPaid] = await withPaidAmount([invoice], schoolId);

    return res.status(200).json(withPaid);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}