import type { Request, Response } from "express";
import { createClass } from "./service.js";
import { prisma } from "../../prisma.js";

export async function createClassController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;

    const classData = await createClass({
      ...req.body,
      schoolId,
    });

    res.status(201).json(classData);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function getClassesController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: {
        enrollments: true,
        teacherAssignments: true,
        feeStructures: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(classes);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getClassController(req: Request, res: Response) {
  try {
    const classId = Array.isArray(req.params.classId)
      ? req.params.classId[0]
      : req.params.classId;
    const schoolId = (req as any).schoolId;

    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        schoolId,
      },
      include: {
        enrollments: {
          include: {
            student: true,
          },
        },
        teacherAssignments: {
          include: {
            teacher: true,
            subject: true,
          },
        },
        feeStructures: true,
      },
    });

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json(classData);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateClassController(req: Request, res: Response) {
  try {
    const classId = Array.isArray(req.params.classId)
      ? req.params.classId[0]
      : req.params.classId;
    const schoolId = (req as any).schoolId;

    const updated = await prisma.class.update({
      where: { id: classId },
      data: req.body,
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function deleteClassController(req: Request, res: Response) {
  try {
    const classId = Array.isArray(req.params.classId)
      ? req.params.classId[0]
      : req.params.classId;

    await prisma.class.delete({
      where: { id: classId },
    });

    return res.status(200).json({
      message: "Class deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}