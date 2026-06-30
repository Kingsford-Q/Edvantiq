// src/modules/communication/controller.js

import type { Request, Response } from "express";
import { createAnnouncement } from "./service.js";
import { prisma } from "../../prisma.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";

export async function createAnnouncementController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const announcement = await createAnnouncement({
      ...req.body,
      schoolId,
    });

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
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
    return res.status(400).json({ message: safeErrorMessage(error) });
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
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function updateAnnouncementController(req: Request, res: Response) {
  try {
    const announcementId = Array.isArray(req.params.announcementId)
      ? req.params.announcementId[0]
      : req.params.announcementId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.announcement.updateMany({
      where: { id: announcementId, schoolId },
      data: sanitizeUpdate(req.body),
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const updated = await prisma.announcement.findUnique({ where: { id: announcementId } });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function deleteAnnouncementController(req: Request, res: Response) {
  try {
    const announcementId = Array.isArray(req.params.announcementId)
      ? req.params.announcementId[0]
      : req.params.announcementId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.announcement.deleteMany({
      where: { id: announcementId, schoolId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}