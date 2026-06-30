// src/modules/academics/controller.js

import type { Request, Response } from "express";
import { createAssessment } from "./service.js";
import { prisma } from "../../prisma.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

const VALID_ASSESSMENT_TYPES = ["CA", "EXAM", "QUIZ"];

export async function createAssessmentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    if (!VALID_ASSESSMENT_TYPES.includes(req.body.type)) {
      return res.status(400).json({
        message: `type must be one of: ${VALID_ASSESSMENT_TYPES.join(", ")}`,
      });
    }

    const assessment = await createAssessment({
      ...sanitizeUpdate(req.body),
      schoolId,
    });

    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
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
    return res.status(400).json({ message: safeErrorMessage(error) });
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
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function updateAssessmentController(req: Request, res: Response) {
  try {
    const assessmentId = Array.isArray(req.params.assessmentId)
      ? req.params.assessmentId[0]
      : req.params.assessmentId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.assessment.updateMany({
      where: { id: assessmentId, schoolId },
      data: sanitizeUpdate(req.body),
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const updated = await prisma.assessment.findUnique({ where: { id: assessmentId } });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function deleteAssessmentController(req: Request, res: Response) {
  try {
    const assessmentId = Array.isArray(req.params.assessmentId)
      ? req.params.assessmentId[0]
      : req.params.assessmentId;
    const schoolId = (req as any).schoolId;

    const result = await prisma.assessment.deleteMany({
      where: { id: assessmentId, schoolId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    return res.status(200).json({
      message: "Assessment deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}