// src/modules/communication/notification.query.controller.js

import type { Request, Response } from "express";
import { getUserNotifications } from "./notification.query.service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function notificationFeedController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const schoolId = (req as any).schoolId;

    const notifications = await getUserNotifications(userId, schoolId);

    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}