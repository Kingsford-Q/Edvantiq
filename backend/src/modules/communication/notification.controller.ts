// src/modules/communication/notification.controller.js

import type { Request, Response } from "express";
import { createNotification } from "./notification.service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function createNotificationController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const notification = await createNotification({
      ...req.body,
      schoolId,
    });

    res.status(201).json(notification);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}