// src/modules/academics/routes.js

import { Router } from "express";
import {
  createAssessmentController,
  getAssessmentsController,
  getAssessmentController,
  updateAssessmentController,
  deleteAssessmentController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

const router = Router();

router.post(
  "/assessment",
  authMiddleware,
  requirePermission(PERMISSIONS.CREATE_ASSESSMENT),
  createAssessmentController
);

router.get(
  "/assessment",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_ASSESSMENT),
  getAssessmentsController
);

router.get(
  "/assessment/:assessmentId",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_ASSESSMENT),
  getAssessmentController
);

router.put(
  "/assessment/:assessmentId",
  authMiddleware,
  requirePermission(PERMISSIONS.UPDATE_ASSESSMENT),
  updateAssessmentController
);

router.delete(
  "/assessment/:assessmentId",
  authMiddleware,
  requirePermission(PERMISSIONS.DELETE_ASSESSMENT),
  deleteAssessmentController
);

export default router;