import type { Request, Response } from "express";
import { enrollStudent } from "./service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function enrollStudentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const enrollment = await enrollStudent({
      ...req.body,
      schoolId,
    });

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}