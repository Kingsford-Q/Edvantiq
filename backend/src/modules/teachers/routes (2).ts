import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

import {
  createTeacherController,
  getTeachersController,
  getTeacherController,
  updateTeacherController,
  deleteTeacherController,
} from "./controller.js";

const router = Router();

/**
 * CREATE TEACHER
 */
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_TEACHER),
  createTeacherController
);

/**
 * GET ALL TEACHERS
 */
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_TEACHER),
  getTeachersController
);

/**
 * GET SINGLE TEACHER
 */
router.get(
  "/:teacherId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_TEACHER),
  getTeacherController
);

/**
 * UPDATE TEACHER
 */
router.put(
  "/:teacherId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_TEACHER),
  updateTeacherController
);

/**
 * DELETE TEACHER
 */
router.delete(
  "/:teacherId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_TEACHER),
  deleteTeacherController
);

export default router;