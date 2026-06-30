import type { Request, Response } from "express";
import { onboardTeacher } from "./teacherOnboarding.service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function teacherOnboardingController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const teacher = await onboardTeacher({
      ...req.body,
      schoolId,
    });

    return res.status(201).json({
      message: "Teacher onboarded successfully",
      data: teacher,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: safeErrorMessage(error),
    });
  }
}