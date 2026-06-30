
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

export async function listSchools() {
  return prisma.school.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getSchoolById(id: string) {
  const school = await prisma.school.findUnique({ where: { id } });
  if (!school) throw new Error("School not found");
  return school;
}

export async function updateSchool(
  id: string,
  data: { name?: string; type?: string; location?: string }
) {
  return prisma.school.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      location: data.location,
    },
  });
}