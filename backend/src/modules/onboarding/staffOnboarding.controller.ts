import type { Request, Response } from "express";
import { onboardStaff } from "./staffOnboarding.service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function staffOnboardingController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const result = await onboardStaff({
      ...req.body,
      schoolId,
    });

    return res.status(201).json({
      message: "Staff onboarded successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: safeErrorMessage(error),
    });
  }
}