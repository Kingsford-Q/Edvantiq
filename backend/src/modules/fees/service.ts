// src/modules/fees/service.js

import { prisma } from "../../prisma.js";

export async function createFeeStructure(data: {
  title: string;
  amount: number;
  term?: string;
  classId: string;
  schoolId: string;
}) {
  return prisma.feeStructure.create({
    data: {
      title: data.title,
      amount: data.amount,
      term: data.term,
      classId: data.classId,
      schoolId: data.schoolId,
    },
  });
}

export async function recordPayment(data: {
  studentId: string;
  feeId: string;
  amountPaid: number;
  method: string;
  schoolId: string;
}) {
  return prisma.feePayment.create({
    data: {
      studentId: data.studentId,
      feeId: data.feeId,
      amountPaid: data.amountPaid,
      method: data.method,
      schoolId: data.schoolId,
    },
  });
}