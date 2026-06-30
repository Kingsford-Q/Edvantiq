import { prisma } from "../../prisma.js";

export async function createStudent(data: {
  fullName: string;
  indexNo?: string;
  schoolId: string;
}) {
  const student = await prisma.student.create({
    data: {
      fullName: data.fullName,
      indexNo: data.indexNo,
      schoolId: data.schoolId,
    },
  });

  return student;
}