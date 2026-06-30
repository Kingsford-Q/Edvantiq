import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";
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

    const assessment = await prisma.assessment.create({
      data: {
        title: req.body.title,
        type: req.body.type,
        totalMark: req.body.totalMark,
        classId: req.body.classId,
        subjectId: req.body.subjectId,
        schoolId,
        academicYearId: req.body.academicYearId,
      },
    });

    return res.status(201).json(assessment);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function enterResultController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const { assessmentId, studentId, score, remark } = req.body;

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, schoolId },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (typeof score !== "number" || score < 0 || score > assessment.totalMark) {
      return res.status(400).json({
        message: `score must be a number between 0 and ${assessment.totalMark}`,
      });
    }

    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId,
        studentId,
        score,
        remark,
      },
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getResultsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const results = await prisma.assessmentResult.findMany({
      where: {
        assessment: {
          schoolId,
        },
      },
      include: {
        assessment: true,
        student: true,
      },
    });

    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getStudentResultsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;

    const results = await prisma.assessmentResult.findMany({
      where: {
        studentId,
        assessment: {
          schoolId,
        },
      },
      include: {
        assessment: true,
      },
    });

    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(400).json({ message: safeErrorMessage(error) });
  }
}