import { prisma } from "../prisma.js";

export function prismaWithTenant(schoolId: string) {
  return {
    student: {
      findMany: (args: any = {}) =>
        prisma.student.findMany({
          ...args,
          where: {
            ...args.where,
            schoolId,
          },
        }),

      create: (args: any) =>
        prisma.student.create({
          ...args,
          data: {
            ...args.data,
            schoolId,
          },
        }),
    },

    user: {
      findMany: (args: any = {}) =>
        prisma.user.findMany({
          ...args,
          where: {
            ...args.where,
            schoolId,
          },
        }),
    },
  };
}