import { prisma } from "../../prisma.js";
import bcrypt from "bcrypt";

export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  roleId: string;
  schoolId: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      password: hashedPassword,
      roleId: data.roleId,
      schoolId: data.schoolId,
    },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
}