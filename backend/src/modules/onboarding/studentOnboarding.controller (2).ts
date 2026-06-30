import type { Request, Response } from "express";
import { onboardStudent } from "./studentOnboarding.service.js";

export async function studentOnboardingController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const result = await onboardStudent({
      ...req.body,
      schoolId,
    });

    return res.status(201).json({
      message: "Student onboarded successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}