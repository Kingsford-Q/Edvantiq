// src/modules/teachers/service.js

import { prisma } from "../../prisma.js";

export async function createTeacher(data: {
  fullName: string;
  subject?: string;
  schoolId: string;
}) {
  return prisma.teacher.create({
    data: {
      fullName: data.fullName,
      subject: data.subject,
      schoolId: data.schoolId,
    },
  });
}