import { prisma } from "../../prisma.js";
import { validateRequired } from "../../utils/validatePayload.js";

export async function onboardParent(data: {
  fullName: string;
  email: string;
  password: string;

  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;

  studentIds: string[];
  schoolId: string;
}) {
  validateRequired(data, ["fullName", "email", "password", "studentIds"]);

  return await prisma.$transaction(async (tx) => {
    // 1. Create user
    const user = await tx.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password, // assume hashed in auth layer
        schoolId: data.schoolId,

        phoneNumber: data.phoneNumber,
        address: data.address,
        profileImageUrl: data.profileImageUrl,
        emergencyContact: data.emergencyContact,
      },
    });

    // 2. Assign role
    const role = await tx.role.findFirst({
      where: {
        name: "PARENT",
        schoolId: data.schoolId,
      },
    });

    if (!role) throw new Error("PARENT role not found");

    await tx.user.update({
      where: { id: user.id },
      data: { roleId: role.id },
    });

    // 3. Link students (ParentStudent junction)
    await tx.parentStudent.createMany({
      data: data.studentIds.map((studentId) => ({
        parentId: user.id,
        studentId,
        schoolId: data.schoolId,
      })),
    });

    return user;
  });
}