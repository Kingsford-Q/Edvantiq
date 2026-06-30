import { Router } from "express";
import { assignTeacherController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  assignTeacherController
);

export default router;