import type { Request, Response } from "express";
import { onboardUser } from "./onboarding.service.js";

export async function onboardingController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const result = await onboardUser({
      type: req.body.type,
      payload: req.body.payload,
      schoolId,
    });

    return res.status(201).json({
      message: "Onboarding successful",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}