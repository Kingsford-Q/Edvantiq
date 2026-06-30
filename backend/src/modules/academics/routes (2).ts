// src/modules/academics/routes.js

import { Router } from "express";
import { createAssessmentController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/assessment",
  authMiddleware,
  rbac(["ADMIN", "TEACHER"]),
  createAssessmentController
);

export default router;