import { prisma } from "../../prisma.js";

export async function enrollStudent(data: {
  studentId: string;
  classId: string;
  schoolId: string;
}) {
  // 1. Create enrollment
  const enrollment = await prisma.enrollment.create({
    data,
  });

  // 2. Get all fee structures for that class
  const feeStructures = await prisma.feeStructure.findMany({
    where: {
      classId: data.classId,
      schoolId: data.schoolId,
    },
  });

  await prisma.studentFee.deleteMany({
    where: {
      studentId: data.studentId,
      schoolId: data.schoolId,
    },
  });

  // 3. Auto-create StudentFee records
  await prisma.studentFee.createMany({
    data: feeStructures.map((fee) => ({
      studentId: data.studentId,
      feeId: fee.id,
      amountDue: fee.amount,
      schoolId: data.schoolId,
    })),
  });

  return enrollment;
}