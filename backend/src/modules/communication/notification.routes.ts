// src/modules/communication/notification.routes.js

import { Router } from "express";
import { createNotificationController } from "./notification.controller.js";
import { notificationFeedController } from "./notification.query.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createNotificationController);
router.get("/", authMiddleware, notificationFeedController);

export default router;