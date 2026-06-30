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

  const role = await prisma.role.findFirst({
    where: { id: data.roleId, schoolId: data.schoolId },
  });

  if (!role) throw new Error("Role not found");

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

export async function listRoles(schoolId: string) {
  return prisma.role.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
}

export async function listUsers(schoolId: string) {
  return prisma.user.findMany({
    where: { schoolId },
    select: {
      id: true,
      email: true,
      fullName: true,
      profileImageUrl: true,
      role: { select: { name: true } },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function getOwnProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      address: true,
      profileImageUrl: true,
      schoolId: true,
      role: { select: { name: true } },
    },
  });

  if (!user) throw new Error("User not found");

  return user;
}

export async function updateOwnProfile(
  userId: string,
  data: { fullName?: string; phoneNumber?: string; address?: string; profileImageUrl?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      profileImageUrl: data.profileImageUrl,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      address: true,
      profileImageUrl: true,
    },
  });
}

export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect");

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
}