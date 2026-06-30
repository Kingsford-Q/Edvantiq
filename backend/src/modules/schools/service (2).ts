
import { prisma } from "../../prisma.js";

export async function createSchool(data: {
  name: string;
  type: string;
  location: string;
}) {
  const school = await prisma.school.create({
    data: {
      name: data.name,
      type: data.type,
      location: data.location,
    },
  });

  return school;
}

export async function setupSchoolDefaults(schoolId: string) {
  const roles = ["ADMIN", "TEACHER", "STUDENT"];

  for (const role of roles) {
    await prisma.role.create({
      data: {
        name: role,
        schoolId,
      },
    });
  }
}