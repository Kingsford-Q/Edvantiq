import { Router } from "express";
import { getAuditLogsController, createAuditLogController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";

const router = Router();

// =========================
// GET ALL AUDIT LOGS
// =========================
router.get(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  getAuditLogsController
);

// =========================
// CREATE AUDIT LOG (manual/test)
// =========================
router.post(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  createAuditLogController
);

export default router;