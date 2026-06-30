// src/modules/academics/service.js

import { prisma } from "../../prisma.js";

export async function createAssessment(data: {
  title: string;
  type: "CA" | "EXAM" | "QUIZ";
  totalMark: number;
  classId: string;
  subjectId: string;
  schoolId: string;
}) {
  return prisma.assessment.create({
    data: {
      title: data.title,
      type: data.type,
      totalMark: data.totalMark,
      classId: data.classId,
      subjectId: data.subjectId,
      schoolId: data.schoolId,
    },
  });
}