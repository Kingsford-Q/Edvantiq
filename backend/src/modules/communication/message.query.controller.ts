// src/modules/communication/message.query.controller.js

import type { Request, Response } from "express";
import { getInbox, getSentMessages } from "./message.query.service.js";

export async function inboxController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const schoolId = (req as any).user.schoolId;

    const messages = await getInbox(userId, schoolId);

    res.status(200).json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function sentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const schoolId = (req as any).user.schoolId;

    const messages = await getSentMessages(userId, schoolId);

    res.status(200).json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}