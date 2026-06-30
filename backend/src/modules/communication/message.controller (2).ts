// src/modules/communication/message.controller.js

import type { Request, Response } from "express";
import { sendMessage } from "./message.service.js";

export async function sendMessageController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;
    const senderId = (req as any).user.id;

    const message = await sendMessage({
      senderId,
      ...req.body,
      schoolId,
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}