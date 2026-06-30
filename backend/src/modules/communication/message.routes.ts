// src/modules/communication/message.routes.js

import { Router } from "express";
import {
  sendMessageController,
  getMessagesController,
  getMessageController,
} from "./message.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

const router = Router();

router.post(
  "/send",
  authMiddleware,
  requirePermission(PERMISSIONS.SEND_MESSAGE),
  sendMessageController
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_MESSAGES),
  getMessagesController
);

router.get(
  "/:messageId",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_MESSAGES),
  getMessageController
);

export default router;