// src/modules/communication/service.js

import { prisma } from "../../prisma.js";

export async function createAnnouncement(data: {
  title: string;
  message: string;
  type: string;
  schoolId: string;
}) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      schoolId: data.schoolId,
    },
  });
}