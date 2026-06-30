import { prisma } from "../../prisma.js";

export async function getAuditLogs(schoolId: string) {
  return await prisma.auditLog.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
  });
}

export async function logAction(data: {
  userId: string;
  schoolId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
}) {
  return await prisma.auditLog.create({
    data: {
      userId: data.userId,
      schoolId: data.schoolId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      metadata: data.metadata ?? {},
    },
  });
}