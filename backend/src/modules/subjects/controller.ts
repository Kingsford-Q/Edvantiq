import type { Request, Response } from "express";
import { createSubject } from "./service.js";
import { prisma } from "../../prisma.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function createSubjectController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const subject = await createSubject({
      ...sanitizeUpdate(req.body),
      schoolId,
    });

    res.status(201).json(subject);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getSubjectsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const subjects = await prisma.subject.findMany({
      where: { schoolId },
      include: {
        teacherAssignments: {
          include: {
            teacher: true,
            class: true,
          },
        },
        assessments: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(subjects);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getSubjectController(req: Request, res: Response) {
  try {
    const subjectId = Array.isArray(req.params.subjectId)
      ? req.params.subjectId[0]
      : req.params.subjectId;
    const schoolId = (req as any).schoolId;

    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        schoolId,
      },
      include: {
        teacherAssignments: {
          include: {
            teacher: true,
            class: true,
          },
        },
        assessments: {
          include: {
            class: true,
            results: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json(subject);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function updateSubjectController(req: Request, res: Response) {
  try {
    const subjectId = Array.isArray(req.params.subjectId)
      ? req.params.subjectId[0]
      : req.params.subjectId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.subject.updateMany({
      where: { id: subjectId, schoolId },
      data: sanitizeUpdate(req.body),
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const updated = await prisma.subject.findUnique({ where: { id: subjectId } });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function deleteSubjectController(req: Request, res: Response) {
  try {
    const subjectId = Array.isArray(req.params.subjectId)
      ? req.params.subjectId[0]
      : req.params.subjectId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.subject.deleteMany({
      where: { id: subjectId, schoolId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}