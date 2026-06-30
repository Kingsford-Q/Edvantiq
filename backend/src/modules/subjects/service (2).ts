// src/modules/subjects/service.ts

import { prisma } from "../../prisma.js";

export async function createSubject(data: {
  name: string;
  schoolId: string;
}) {
  return prisma.subject.create({
    data: {
      name: data.name,
      schoolId: data.schoolId,
    },
  });
}