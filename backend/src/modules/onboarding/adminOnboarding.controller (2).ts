import type { Request, Response } from "express";
import { onboardAdmin } from "./adminOnboarding.service.js";

export async function adminOnboardingController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;

    const admin = await onboardAdmin({
      ...req.body,
      schoolId,
    });

    return res.status(201).json({
      message: "Admin onboarded successfully",
      data: admin,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}