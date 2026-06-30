// src/modules/schools/routes.ts

import { Router } from "express";
import {
  createSchoolController,
  listSchoolsController,
  getSchoolController,
  updateSchoolController,
} from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../../middleware/requireSuperAdmin.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post("/", authMiddleware, requireSuperAdmin, createSchoolController);
router.get("/", authMiddleware, requireSuperAdmin, listSchoolsController);
router.get("/:id", authMiddleware, rbac(["ADMIN"]), getSchoolController);
router.put("/:id", authMiddleware, rbac(["ADMIN"]), updateSchoolController);

export default router;