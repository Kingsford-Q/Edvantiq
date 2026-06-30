// src/modules/users/controller.ts

import type { Request, Response } from "express";
import { createUser } from "./service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

export async function createUserController(req: Request, res: Response) {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}