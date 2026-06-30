import { Router } from "express";
import {
  createClassController,
  getClassesController,
  getClassController,
  updateClassController,
  deleteClassController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  createClassController
);

router.get(
  "/",
  authMiddleware,
  getClassesController
);

router.get(
  "/:classId",
  authMiddleware,
  getClassController
);

router.put(
  "/:classId",
  authMiddleware,
  rbac(["ADMIN"]),
  updateClassController
);

router.delete(
  "/:classId",
  authMiddleware,
  rbac(["ADMIN"]),
  deleteClassController
);

export default router;