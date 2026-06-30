import { Router } from "express";
import { getAuditLogsController } from "./controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { rbac } from "../../middleware/rbacMiddleware.js";
import { createAuditLogController } from "./controller.js";


const router = Router();

// =========================
// GET ALL AUDIT LOGS
// =========================
router.get("/", getAuditLogsController);

// =========================
// CREATE AUDIT LOG (manual/test)
// =========================
router.post("/", createAuditLogController);

router.get(
  "/",
  authMiddleware,
  rbac(["ADMIN"]),
  getAuditLogsController
);

export default router;