import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

import {
  createSessionController,
  markAttendanceController,
  getAttendanceSessionsController,
  getAttendanceRecordsController,
} from "./controller.js";

const router = Router();

/**
 * CREATE ATTENDANCE SESSION
 * (Teacher creates a class session)
 */
router.post(
  "/session",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_ATTENDANCE_SESSION),
  createSessionController
);

/**
 * MARK ATTENDANCE
 * (Teacher marks students present/absent)
 */
router.post(
  "/mark",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.MARK_ATTENDANCE),
  markAttendanceController
);

/**
 * GET ALL ATTENDANCE SESSIONS
 */
router.get(
  "/sessions",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE),
  getAttendanceSessionsController
);

/**
 * GET ATTENDANCE RECORDS FOR SESSION
 */
router.get(
  "/:sessionId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE),
  getAttendanceRecordsController
);

export default router;