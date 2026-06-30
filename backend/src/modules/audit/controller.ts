import type { Request, Response } from "express";
import { getAuditLogs, logAction } from "./service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

// =========================
// GET AUDIT LOGS
// =========================
export async function getAuditLogsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const logs = await getAuditLogs(schoolId);

    return res.status(200).json(logs);
  } catch (err: any) {
    return res.status(500).json({
      message: safeErrorMessage(err),
    });
  }
}

// =========================
// MANUAL LOG (TEST ONLY)
// =========================
export async function createAuditLogController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const schoolId = (req as any).schoolId;

    const { action, entity, entityId, metadata } = req.body;

    const log = await logAction({
      userId: user.id,
      schoolId,
      action,
      entity,
      entityId,
      metadata,
    });

    return res.status(201).json(log);
  } catch (err: any) {
    return res.status(500).json({
      message: safeErrorMessage(err),
    });
  }
}