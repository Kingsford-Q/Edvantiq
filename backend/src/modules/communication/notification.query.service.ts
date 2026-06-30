// src/modules/communication/notification.query.service.js

import { prisma } from "../../prisma.js";

export async function getUserNotifications(userId: string, schoolId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      schoolId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}