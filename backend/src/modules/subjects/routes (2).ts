import { Router } from "express";
import {
  createSubjectController,
  getSubjectsController,
  getSubjectController,
  updateSubjectController,
  deleteSubjectController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  createSubjectController
);

router.get(
  "/",
  authMiddleware,
  getSubjectsController
);

router.get(
  "/:subjectId",
  authMiddleware,
  getSubjectController
);

router.put(
  "/:subjectId",
  authMiddleware,
  rbac(["ADMIN"]),
  updateSubjectController
);

router.delete(
  "/:subjectId",
  authMiddleware,
  rbac(["ADMIN"]),
  deleteSubjectController
);

export default router;