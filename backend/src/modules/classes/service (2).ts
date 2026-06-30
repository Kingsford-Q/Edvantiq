import { prisma } from "../../prisma.js";

export async function createClass(data: {
  name: string;
  level?: string;
  schoolId: string;
}) {
  return prisma.class.create({
    data: {
      name: data.name,
      level: data.level,
      schoolId: data.schoolId,
    },
  });
}