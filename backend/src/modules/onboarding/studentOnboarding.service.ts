import { prisma } from "../../prisma.js";
import { validateRequired } from "../../utils/validatePayload.js";

export async function onboardStudent(data: {
  fullName: string;
  indexNo?: string;
  classId: string;
  schoolId: string;

  // enrichment fields (optional)
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}) {
  // 1. Validate required fields
  validateRequired(data, ["fullName", "classId"]);

  return await prisma.$transaction(async (tx) => {
    // 2. Create student profile
    const student = await tx.student.create({
      data: {
        fullName: data.fullName,
        indexNo: data.indexNo,
        schoolId: data.schoolId,

        // enrichment
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : undefined,

        gender: data.gender,
        address: data.address,
        phoneNumber: data.phoneNumber,
        profileImageUrl: data.profileImageUrl,
      },
    });

    // 3. Auto-enroll student into class
    await tx.enrollment.create({
      data: {
        studentId: student.id,
        classId: data.classId,
        schoolId: data.schoolId,
      },
    });

    // 4. Generate fee mapping (StudentFee)
    const feeStructures = await tx.feeStructure.findMany({
      where: {
        classId: data.classId,
        schoolId: data.schoolId,
      },
    });

    await tx.studentFee.createMany({
      data: feeStructures.map((fee) => ({
        studentId: student.id,
        feeId: fee.id,
        amountDue: fee.amount,
        schoolId: data.schoolId,
      })),
    });

    return student;
  });
}