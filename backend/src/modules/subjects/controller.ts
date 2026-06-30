import type { Request, Response } from "express";
import { createSubject } from "./service.js";
import { prisma } from "../../prisma.js";

export async function createSubjectController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const subject = await createSubject({
      ...req.body,
      schoolId,
    });

    res.status(201).json(subject);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
  }
}

export async function updateSubjectController(req: Request, res: Response) {
  try {
    const subjectId = Array.isArray(req.params.subjectId)
      ? req.params.subjectId[0]
      : req.params.subjectId;
    const schoolId = (req as any).schoolId;

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: req.body,
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function deleteSubjectController(req: Request, res: Response) {
  try {
    const subjectId = Array.isArray(req.params.subjectId)
      ? req.params.subjectId[0]
      : req.params.subjectId;

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}