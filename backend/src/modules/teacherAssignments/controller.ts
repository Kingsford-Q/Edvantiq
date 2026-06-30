import type { Request, Response } from "express";
import { assignTeacher } from "./service.js";

export async function assignTeacherController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;

    const assignment = await assignTeacher({
      ...req.body,
      schoolId,
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}