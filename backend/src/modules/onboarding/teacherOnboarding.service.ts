import { prisma } from "../../prisma.js";
import { hashPassword } from "../../utils/password.js";
import { validateRequired } from "../../utils/validatePayload.js";

export async function onboardTeacher(data: {
  fullName: string;
  email: string;
  password: string;
  subject?: string;
  schoolId: string;

  phoneNumber?: string;
  address?: string;
  qualification?: string;
  employmentType?: string;
  hireDate?: string;
  profileImageUrl?: string;
}) {
  validateRequired(data, ["fullName", "email", "password"]);

  return await prisma.$transaction(async (tx) => {
    // 1. Create user
    const hashedPassword = await hashPassword(data.password);

    const user = await tx.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        schoolId: data.schoolId,
      },
    });

    // 2. Assign TEACHER role
    const role = await tx.role.findFirst({
      where: {
        name: "TEACHER",
        schoolId: data.schoolId,
      },
    });

    if (!role) throw new Error("TEACHER role not found");

    await tx.user.update({
      where: { id: user.id },
      data: { roleId: role.id },
    });

    // 3. Create teacher profile
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        subject: data.subject,

        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        qualification: data.qualification,
        employmentType: data.employmentType,
        hireDate: data.hireDate
          ? new Date(data.hireDate)
          : undefined,

        profileImageUrl: data.profileImageUrl,
        schoolId: data.schoolId,
      },
    });

    return teacher;
  });
}