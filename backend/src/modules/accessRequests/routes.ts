import { Router } from "express";
import {
  requestAccessController,
  approveAccessRequestController,
  rejectAccessRequestController,
  getAccessRequestsController,
} from "./controller.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../../middleware/requireSuperAdmin.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

// SUPER ADMIN requests access to a school
router.post(
  "/request",
  authMiddleware,
  requireSuperAdmin,
  requestAccessController
);

// School admin views pending requests
router.get(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  getAccessRequestsController
);

// School admin approves request
router.patch(
  "/:id/approve",
  authMiddleware,
  rbac(["ADMIN"]),
  approveAccessRequestController
);

// School admin rejects request
router.patch(
  "/:id/reject",
  authMiddleware,
  rbac(["ADMIN"]),
  rejectAccessRequestController
);

export default router;