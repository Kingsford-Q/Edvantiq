import { Router } from "express";
import {
  createClassController,
  getClassesController,
  getClassController,
  updateClassController,
  deleteClassController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { PERMISSIONS } from "../../rbac/permissions.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.CREATE_CLASS),
  createClassController
);

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_CLASS),
  getClassesController
);

router.get(
  "/:classId",
  authMiddleware,
  requirePermission(PERMISSIONS.VIEW_CLASS),
  getClassController
);

router.put(
  "/:classId",
  authMiddleware,
  requirePermission(PERMISSIONS.UPDATE_CLASS),
  updateClassController
);

router.delete(
  "/:classId",
  authMiddleware,
  requirePermission(PERMISSIONS.DELETE_CLASS),
  deleteClassController
);

export default router;