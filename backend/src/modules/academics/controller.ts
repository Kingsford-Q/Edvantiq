// src/modules/academics/controller.js

import type { Request, Response } from "express";
import { createAssessment } from "./service.js";
import { prisma } from "../../prisma.js";

export async function createAssessmentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;

    const assessment = await createAssessment({
      ...req.body,
      schoolId,
    });

    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function getAssessmentsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const assessments = await prisma.assessment.findMany({
      where: { schoolId },
      include: {
        class: true,
        subject: true,
        results: {
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(assessments);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getAssessmentController(req: Request, res: Response) {
  try {
    const assessmentId = Array.isArray(req.params.assessmentId)
      ? req.params.assessmentId[0]
      : req.params.assessmentId;
    const schoolId = (req as any).schoolId;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        schoolId,
      },
      include: {
        class: true,
        subject: true,
        results: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    return res.status(200).json(assessment);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateAssessmentController(req: Request, res: Response) {
  try {
    const assessmentId = Array.isArray(req.params.assessmentId)
      ? req.params.assessmentId[0]
      : req.params.assessmentId;
    const schoolId = (req as any).schoolId;

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: req.body,
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function deleteAssessmentController(req: Request, res: Response) {
  try {
    const assessmentId = Array.isArray(req.params.assessmentId)
      ? req.params.assessmentId[0]
      : req.params.assessmentId;

    await prisma.assessment.delete({
      where: { id: assessmentId },
    });

    return res.status(200).json({
      message: "Assessment deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}