// src/modules/communication/routes.js

import { Router } from "express";
import {
  createAnnouncementController,
  getAnnouncementsController,
  getAnnouncementController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

const router = Router();

router.post(
  "/announcement",
  authMiddleware,
  requirePermission(PERMISSIONS.CREATE_ANNOUNCEMENT),
  createAnnouncementController
);

router.get(
  "/announcements",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_ANNOUNCEMENT),
  getAnnouncementsController
);

router.get(
  "/announcement/:announcementId",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_ANNOUNCEMENT),
  getAnnouncementController
);

export default router;