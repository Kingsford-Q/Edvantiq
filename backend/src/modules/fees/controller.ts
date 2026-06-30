// src/modules/fees/controller.js

import type { Request, Response } from "express";
import { createFeeStructure, recordPayment } from "./service.js";

export async function createFeeController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;

    const fee = await createFeeStructure({
      ...req.body,
      schoolId,
    });

    res.status(201).json(fee);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function paymentController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;

    const payment = await recordPayment({
      ...req.body,
      schoolId,
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}