// src/modules/communication/message.query.service.js

import { prisma } from "../../prisma.js";

export async function getInbox(userId: string, schoolId: string) {
  return prisma.message.findMany({
    where: {
      receiverId: userId,
      schoolId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getSentMessages(userId: string, schoolId: string) {
  return prisma.message.findMany({
    where: {
      senderId: userId,
      schoolId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}