import { prisma } from "../prisma.js";

export async function seedRoles(schoolId: string) {
  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
      schoolId,
      isSystem: true,
      permissions: {
        create: [
          { action: "school:create" },
          { action: "users:manage" },
          { action: "attendance:mark" },
          { action: "fees:manage" },
        ],
      },
    },
  });

  const teacherRole = await prisma.role.create({
    data: {
      name: "TEACHER",
      schoolId,
      permissions: {
        create: [
          { action: "attendance:mark" },
          { action: "grades:update" },
        ],
      },
    },
  });

  const studentRole = await prisma.role.create({
    data: {
      name: "STUDENT",
      schoolId,
      permissions: {
        create: [
          { action: "results:view" },
        ],
      },
    },
  });

  return { adminRole, teacherRole, studentRole };
}