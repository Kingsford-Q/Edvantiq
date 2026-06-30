// src/modules/schools/routes.ts

import { Router } from "express";
import { createSchoolController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../../middleware/requireSuperAdmin.js";

const router = Router();

router.post("/", authMiddleware, requireSuperAdmin, createSchoolController);

export default router;