import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";
import { AccessRequestStatus } from "@prisma/client";
import { logAction } from "../audit/service.js";
import { AuditActions } from "../audit/actions.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

// =========================
// GET ACCESS REQUESTS

export async function getAccessRequestsController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const schoolId = (req as any).schoolId;

    const requests = await prisma.accessRequest.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });

    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
      await logAction({
        userId: user.id,
        schoolId,
        action: "ACCESS_REQUEST_VIEWED",
        entity: "AccessRequest",
        metadata: {
          count: requests.length,
        },
      });
    }

    return res.status(200).json(requests);
  } catch (error: any) {
    return res.status(500).json({ message: safeErrorMessage(error) });
  }
}

// =========================
// APPROVE REQUEST
export async function approveAccessRequestController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const schoolId = (req as any).schoolId;
    const  id  = req.params.id as string;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const result = await prisma.accessRequest.updateMany({
      where: { id, schoolId },
      data: {
        status: "APPROVED",
        expiresAt,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Access request not found" });
    }

    const updated = await prisma.accessRequest.findUnique({ where: { id } });

    // 🔥 AUDIT LOG
    await logAction({
      userId: user.id,
      schoolId,
      action: AuditActions.ACCESS_REQUEST_APPROVED,
      entity: "AccessRequest",
      entityId: id,
      metadata: {
        expiresAt,
      },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

// =========================
// REJECT REQUEST
export async function rejectAccessRequestController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const schoolId = (req as any).schoolId;
    const  id  = req.params.id as string;

    const result = await prisma.accessRequest.updateMany({
      where: { id, schoolId },
      data: {
        status: "REJECTED",
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Access request not found" });
    }

    const updated = await prisma.accessRequest.findUnique({ where: { id } });

    // 🔥 AUDIT LOG
    await logAction({
      userId: user.id,
      schoolId,
      action: AuditActions.ACCESS_REQUEST_REJECTED,
      entity: "AccessRequest",
      entityId: id,
      metadata: {
        status: "REJECTED",
      },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}


export async function requestAccessController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        message: "schoolId is required",
      });
    }

    const request = await prisma.accessRequest.create({
      data: {
        schoolId,
        requestedById: user.id,
        status: "PENDING",
      },
    });

    await logAction({
      userId: user.id,
      schoolId,
      action: AuditActions.ACCESS_REQUEST_CREATED,
      entity: "AccessRequest",
      entityId: request.id,
      metadata: {
        status: "PENDING",
      },
    });

    return res.status(201).json(request);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}