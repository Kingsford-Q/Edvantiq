// src/modules/communication/notification.service.js

import { prisma } from "../../prisma.js";

export async function createNotification(data: {
  title: string;
  message: string;
  type: string;
  userId: string;
  schoolId: string;
}) {
  return prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId,
      schoolId: data.schoolId,
    },
  });
}