// src/modules/communication/routes.js

import { Router } from "express";
import { createAnnouncementController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

router.post(
  "/announcement",
  authMiddleware,
  rbac(["ADMIN"]),
  createAnnouncementController
);

export default router;