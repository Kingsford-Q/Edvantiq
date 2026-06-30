import type { Request, Response } from "express";
import { createTeacher } from "./service.js";
import { logAction } from "../audit/service.js";
import { AuditActions } from "../audit/actions.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";

export async function createTeacherController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const user = (req as any).user;

    const teacher = await createTeacher({
      ...sanitizeUpdate(req.body),
      schoolId,
    });

    await logAction({
      userId: user.id,
      schoolId,
      action: AuditActions.TEACHER_CREATED,
      entity: "Teacher",
      entityId: teacher.id,
      metadata: {
        fullName: req.body.fullName,
        subject: req.body.subject,
      },
    });

    return res.status(201).json(teacher);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

import { prisma } from "../../prisma.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function getTeachersController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: {
        assignments: true,
      },
    });

    return res.status(200).json(teachers);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}
export async function getTeacherController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId,
      },
      include: {
        assignments: true,
        attendanceSessions: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json(teacher);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function updateTeacherController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    const result = await prisma.teacher.updateMany({
      where: { id: teacherId, schoolId },
      data: sanitizeUpdate(req.body),
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const updated = await prisma.teacher.findUnique({ where: { id: teacherId } });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function deleteTeacherController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    const result = await prisma.teacher.deleteMany({
      where: { id: teacherId, schoolId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}