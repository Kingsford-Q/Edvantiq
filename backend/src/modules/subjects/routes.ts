import { Router } from "express";
import {
  createSubjectController,
  getSubjectsController,
  getSubjectController,
  updateSubjectController,
  deleteSubjectController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.CREATE_SUBJECT),
  createSubjectController
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_SUBJECT),
  getSubjectsController
);

router.get(
  "/:subjectId",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_SUBJECT),
  getSubjectController
);

router.put(
  "/:subjectId",
  authMiddleware,
  requirePermission(PERMISSIONS.UPDATE_SUBJECT),
  updateSubjectController
);

router.delete(
  "/:subjectId",
  authMiddleware,
  requirePermission(PERMISSIONS.DELETE_SUBJECT),
  deleteSubjectController
);

export default router;