import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

import {
  createAssessmentController,
  enterResultController,
  getResultsController,
  getStudentResultsController,
} from "./results.controller.js";

const router = Router();

/**
 * CREATE ASSESSMENT (CA / EXAM / QUIZ)
 */
router.post(
  "/assessment",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.CREATE_ASSESSMENT),
  createAssessmentController
);

/**
 * ENTER STUDENT RESULT
 */
router.post(
  "/enter",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.ENTER_RESULTS),
  enterResultController
);

/**
 * GET ALL RESULTS (SCHOOL / CLASS LEVEL)
 */
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_RESULTS),
  getResultsController
);

/**
 * GET SINGLE STUDENT RESULTS
 */
router.get(
  "/student/:studentId",
  authMiddleware,
  tenantMiddleware,
  requirePermission(PERMISSIONS.VIEW_RESULTS),
  getStudentResultsController
);

export default router;