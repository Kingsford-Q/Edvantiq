// src/modules/communication/controller.js

import type { Request, Response } from "express";
import { createAnnouncement } from "./service.js";
import { prisma } from "../../prisma.js";

export async function createAnnouncementController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const announcement = await createAnnouncement({
      ...req.body,
      schoolId,
    });

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function getAnnouncementsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const announcements = await prisma.announcement.findMany({
      where: { schoolId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(announcements);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getAnnouncementController(req: Request, res: Response) {
  try {
    const announcementId = Array.isArray(req.params.announcementId)
      ? req.params.announcementId[0]
      : req.params.announcementId;
    const schoolId = (req as any).schoolId;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        schoolId,
      },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json(announcement);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}