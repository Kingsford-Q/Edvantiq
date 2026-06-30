import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { rbac } from "../../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

import {
  createStudentController,
  getStudentsController,
  getStudentController,
  updateStudentController,
  deleteStudentController,
  getMyStudentProfileController,
  getMyChildrenController,
} from "./controller.js";

const router = Router();

/**
 * CREATE STUDENT
 */
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_STUDENT),
  createStudentController
);

/**
 * GET ALL STUDENTS
 */
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_STUDENT),
  getStudentsController
);

/**
 * SELF-SERVICE: STUDENT viewing their own profile
 */
router.get(
  "/me",
  authMiddleware,
  tenantMiddleware,
  rbac(["STUDENT"]),
  getMyStudentProfileController
);

/**
 * SELF-SERVICE: PARENT viewing their children
 */
router.get(
  "/my-children",
  authMiddleware,
  tenantMiddleware,
  rbac(["PARENT"]),
  getMyChildrenController
);

/**
 * GET SINGLE STUDENT
 */
router.get(
  "/:studentId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_STUDENT),
  getStudentController
);

/**
 * UPDATE STUDENT
 */
router.put(
  "/:studentId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.UPDATE_STUDENT),
  updateStudentController
);

/**
 * DELETE STUDENT
 */
router.delete(
  "/:studentId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.DELETE_STUDENT),
  deleteStudentController
);

export default router;