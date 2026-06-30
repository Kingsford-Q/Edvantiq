import { Router } from "express";
import {
  requestAccessController,
  approveAccessRequestController,
  rejectAccessRequestController,
  getAccessRequestsController,
  getMyAccessRequestsController,
} from "./controller.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";
import { tenantMiddleware } from "../../middleware/tenantMiddleware.js";
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

// SUPER ADMIN views their own requests across all schools
router.get(
  "/mine",
  authMiddleware,
  requireSuperAdmin,
  getMyAccessRequestsController
);

// School admin views pending requests
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  rbac(["ADMIN"]),
  getAccessRequestsController
);

// School admin approves request
router.patch(
  "/:id/approve",
  authMiddleware,
  tenantMiddleware,
  rbac(["ADMIN"]),
  approveAccessRequestController
);

// School admin rejects request
router.patch(
  "/:id/reject",
  authMiddleware,
  tenantMiddleware,
  rbac(["ADMIN"]),
  rejectAccessRequestController
);

export default router;