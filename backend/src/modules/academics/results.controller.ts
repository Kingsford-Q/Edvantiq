import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";

export async function createAssessmentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

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
    return res.status(400).json({ message: error.message });
  }
}

export async function enterResultController(req: Request, res: Response) {
  try {
    const { assessmentId, studentId, score, remark } = req.body;

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
    return res.status(400).json({ message: error.message });
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
    return res.status(400).json({ message: error.message });
  }
}

export async function getStudentResultsController(req: Request, res: Response) {
  try {
    const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;

    const results = await prisma.assessmentResult.findMany({
      where: {
        studentId,
      },
      include: {
        assessment: true,
      },
    });

    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}