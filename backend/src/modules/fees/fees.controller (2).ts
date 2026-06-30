import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";

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
    return res.status(400).json({ message: error.message });
  }
}

export async function createFeePaymentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const payment = await prisma.feePayment.create({
      data: {
        studentId: req.body.studentId,
        feeId: req.body.feeId,
        amountPaid: req.body.amountPaid,
        method: req.body.method,
        schoolId,
      },
    });

    return res.status(201).json(payment);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
  }
}

export async function createInvoiceController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    let studentId = req.params.studentId;
    if (Array.isArray(studentId)) studentId = studentId[0];

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
        items: {
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
      invoice,
      totalPaid,
      balance: totalAmount - totalPaid,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getInvoicesController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const invoices = await prisma.invoice.findMany({
      where: { schoolId },
      include: {
        student: true,
        items: true,
      },
    });

    return res.status(200).json(invoices);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
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

    return res.status(200).json(invoice);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}