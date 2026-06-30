import { Router } from "express";
import { enrollStudentController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  rbac(["ADMIN", "TEACHER"]),
  enrollStudentController
);

export default router;