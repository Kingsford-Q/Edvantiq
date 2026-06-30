import { prisma } from "../../prisma.js";
import { AccessRequestStatus } from "@prisma/client";

export async function validateSuperAdminAccess(userId: string, schoolId: string) {
  const access = await prisma.accessRequest.findFirst({
    where: {
      requestedById: userId,
      schoolId,
      status: AccessRequestStatus.APPROVED,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return !!access;
}