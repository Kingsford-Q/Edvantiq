import { prisma } from "../../prisma.js";
import { AccessRequestStatus } from "@prisma/client";

// CREATE REQUEST
export async function requestAccess(schoolId: string, userId: string) {
  return await prisma.accessRequest.create({
    data: {
      schoolId,
      requestedById: userId,
      status: AccessRequestStatus.PENDING,
    },
  });
}

// APPROVE REQUEST
export async function approveAccessRequest(requestId: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  return await prisma.accessRequest.update({
    where: { id: requestId },
    data: {
      status: AccessRequestStatus.APPROVED,
      expiresAt,
    },
  });
}

// REJECT REQUEST (GOOD TO HAVE)
export async function rejectAccessRequest(requestId: string) {
  return await prisma.accessRequest.update({
    where: { id: requestId },
    data: {
      status: AccessRequestStatus.REJECTED,
    },
  });
}

// 🔥 GET ALL ACCESS REQUESTS (IMPORTANT)
export async function getAccessRequests(schoolId?: string) {
  return await prisma.accessRequest.findMany({
    where: schoolId ? { schoolId } : undefined,
    include: {
      school: true,
      requestedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// 🔥 GET SINGLE REQUEST (useful for approval screen)
export async function getAccessRequestById(id: string) {
  return await prisma.accessRequest.findUnique({
    where: { id },
    include: {
      school: true,
      requestedBy: true,
    },
  });
}