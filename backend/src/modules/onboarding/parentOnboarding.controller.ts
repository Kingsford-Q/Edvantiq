import type { Request, Response } from "express";
import { onboardParent } from "./parentOnboarding.service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function parentOnboardingController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const parent = await onboardParent({
      ...req.body,
      schoolId,
    });

    return res.status(201).json({
      message: "Parent onboarded successfully",
      data: parent,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: safeErrorMessage(error),
    });
  }
}