import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";

/**
 * CREATE ATTENDANCE SESSION
 * Teacher opens attendance for a class
 */
export async function createSessionController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const user = (req as any).user;

    const session = await prisma.attendanceSession.create({
      data: {
        classId: req.body.classId,
        subjectId: req.body.subjectId,
        teacherId: user.id,
        schoolId,
        date: new Date(req.body.date),
      },
    });

    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function markAttendanceController(req: Request, res: Response) {
  try {
    const { sessionId, studentId, status } = req.body;

    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId,
        status,
      },
    });

    return res.status(201).json(record);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getAttendanceSessionsController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const sessions = await prisma.attendanceSession.findMany({
      where: { schoolId },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(sessions);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getAttendanceRecordsController(req: Request, res: Response) {
  try {
    // ensure sessionId is a string (Express params can be string | string[])
    const sessionIdParam = req.params.sessionId;
    const sessionId = Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        sessionId,
      },
      include: {
        student: true,
      },
    });

    return res.status(200).json(records);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}