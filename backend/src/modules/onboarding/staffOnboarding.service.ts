import { prisma } from "../../prisma.js";
import { hashPassword } from "../../utils/password.js";
import { validateRequired } from "../../utils/validatePayload.js";

export async function onboardStaff(data: {
  fullName: string;
  email: string;
  password: string;
  position: string;
  schoolId: string;
}) {
  validateRequired(data, ["fullName", "email", "password", "position"]);

  return await prisma.$transaction(async (tx) => {
    const hashedPassword = await hashPassword(data.password);

    // 1. Create user
    const user = await tx.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        schoolId: data.schoolId,
      },
    });

    // 2. Get STAFF role
    const role = await tx.role.findFirst({
      where: {
        name: "STAFF",
        schoolId: data.schoolId,
      },
    });

    if (!role) {
      throw new Error("STAFF role not found");
    }

    // 3. Assign role
    await tx.user.update({
      where: { id: user.id },
      data: {
        roleId: role.id,
      },
    });

    // 4. Optional profile (if you add model)
    const staffProfile = await tx.staffProfile?.create({
      data: {
        userId: user.id,
        position: data.position,
        schoolId: data.schoolId,
      },
    });

    return {
      user,
      staffProfile: staffProfile ?? null,
    };
  });
}