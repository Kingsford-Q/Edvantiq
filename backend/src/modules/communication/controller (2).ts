// src/modules/communication/controller.js

import type { Request, Response } from "express";
import { createAnnouncement } from "./service.js";

export async function createAnnouncementController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;

    const announcement = await createAnnouncement({
      ...req.body,
      schoolId,
    });

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}