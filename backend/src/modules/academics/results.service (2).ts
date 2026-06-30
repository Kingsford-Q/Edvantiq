// src/modules/academics/results.service.js

import { prisma } from "../../prisma.js";

export async function addAssessmentResult(data: {
  assessmentId: string;
  studentId: string;
  score: number;
  remark?: string;
}) {
  return prisma.assessmentResult.create({
    data: {
      assessmentId: data.assessmentId,
      studentId: data.studentId,
      score: data.score,
      remark: data.remark,
    },
  });
}