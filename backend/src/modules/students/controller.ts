import { prisma } from "../../prisma.js";
import type { Request, Response } from "express";
import { createStudent } from "./service.js";
import { logAction } from "../audit/service.js";
import { AuditActions } from "../audit/actions.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function createStudentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const user = (req as any).user;

    const student = await createStudent({
      ...sanitizeUpdate(req.body),
      schoolId,
    });

    await logAction({
      userId: user.id,
      schoolId,
      action: AuditActions.STUDENT_CREATED,
      entity: "Student",
      entityId: student.id,
      metadata: {
        fullName: req.body.fullName,
        indexNo: req.body.indexNo,
      },
    });

    return res.status(201).json(student);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getStudentsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const students = await prisma.student.findMany({
      where: { schoolId },
      include: {
        enrollments: true,
      },
    });

    return res.status(200).json(students);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getStudentController(req: Request, res: Response) {
  try {
    const studentId = Array.isArray(req.params.studentId)
  ? req.params.studentId[0]
  : req.params.studentId;
    const schoolId = (req as any).schoolId;

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
      include: {
        enrollments: true,
        attendanceRecords: true,
        results: true,
        payments: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json(student);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}


export async function updateStudentController(req: Request, res: Response) {
  try {
    const studentId = Array.isArray(req.params.studentId)
  ? req.params.studentId[0]
  : req.params.studentId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.student.updateMany({
      where: {
        id: studentId,
        schoolId,
      },
      data: sanitizeUpdate(req.body),
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updated = await prisma.student.findUnique({ where: { id: studentId } });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function deleteStudentController(req: Request, res: Response) {
  try {
    const studentId = Array.isArray(req.params.studentId)
  ? req.params.studentId[0]
  : req.params.studentId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.student.deleteMany({
      where: {
        id: studentId,
        schoolId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}