import type { Request, Response } from "express";
import { createTeacher } from "./service.js";
import { logAction } from "../audit/service.js";
import { AuditActions } from "../audit/actions.js";

export async function createTeacherController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const user = (req as any).user;

    const teacher = await createTeacher({
      ...req.body,
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
    return res.status(400).json({ message: error.message });
  }
}

import { prisma } from "../../prisma.js";

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
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
  }
}

export async function updateTeacherController(req: Request, res: Response) {
  try {
    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: req.body,
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function deleteTeacherController(req: Request, res: Response) {
  try {
    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    return res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}