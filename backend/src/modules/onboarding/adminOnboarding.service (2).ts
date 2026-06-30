import { prisma } from "../../prisma.js";
import { hashPassword } from "../../utils/password.js";
import { validateRequired } from "../../utils/validatePayload.js";

export async function onboardAdmin(data: {
  fullName: string;
  email: string;
  password: string;

  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;

  position?: string;
  staffCode?: string;

  schoolId: string;
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

        phoneNumber: data.phoneNumber,
        address: data.address,
        profileImageUrl: data.profileImageUrl,

        position: data.position,
        staffCode: data.staffCode,
      },
    });

    // 2. Assign ADMIN role
    const role = await tx.role.findFirst({
      where: {
        name: "ADMIN",
        schoolId: data.schoolId,
      },
    });

    if (!role) throw new Error("ADMIN role not found");

    await tx.user.update({
      where: { id: user.id },
      data: { roleId: role.id },
    });

    return user;
  });
}