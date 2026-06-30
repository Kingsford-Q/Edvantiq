// src/modules/communication/message.service.js

import { prisma } from "../../prisma.js";

export async function sendMessage(data: {
  senderId: string;
  receiverId?: string;
  content: string;
  schoolId: string;
}) {
  return prisma.message.create({
    data: {
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      schoolId: data.schoolId,
    },
  });
}