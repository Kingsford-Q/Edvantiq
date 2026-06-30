import { prisma } from "../../prisma.js";
import bcrypt from "bcrypt";
import { comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";

export async function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  schoolId: string;
}) {
  // 1. hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 2. create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      schoolId: data.schoolId,
    },
  });

  // 3. auto-create TEACHER profile
  if (data.role === "TEACHER") {
    await prisma.teacher.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        schoolId: data.schoolId,
      },
    });
  }

  // 4. auto-create STUDENT profile
  if (data.role === "STUDENT") {
    await prisma.student.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        schoolId: data.schoolId,
      },
    });
  }

  // 5. return safe response
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    schoolId: user.schoolId,
  };
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { role: true },
  });

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await comparePassword(data.password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({
    id: user.id,
    email: user.email,
    schoolId: user.schoolId,
    role: user.role?.name,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role?.name,
    },
    token,
  };
}