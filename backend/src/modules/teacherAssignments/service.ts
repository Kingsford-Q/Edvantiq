import { prisma } from "../../prisma.js";

export async function assignTeacher(data: {
  teacherId: string;
  classId: string;
  subjectId: string;
  schoolId: string;
}) {
  return prisma.teacherAssignment.create({
    data: {
      teacherId: data.teacherId,
      classId: data.classId,
      subjectId: data.subjectId,
      schoolId: data.schoolId,
    },
  });
}