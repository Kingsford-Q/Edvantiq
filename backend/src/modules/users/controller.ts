// src/modules/users/controller.ts

import type { Request, Response } from "express";
import {
  createUser,
  listRoles,
  listUsers,
  getOwnProfile,
  updateOwnProfile,
  changeOwnPassword,
} from "./service.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";
import { sanitizeUpdate } from "../../utils/sanitizeUpdate.js";

export async function createUserController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const user = await createUser({ ...req.body, schoolId });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function listRolesController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const roles = await listRoles(schoolId);
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function listUsersController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    const users = await listUsers(schoolId);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function getMeController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const profile = await getOwnProfile(userId);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function updateMeController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const updated = await updateOwnProfile(userId, sanitizeUpdate(req.body));
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    await changeOwnPassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(400).json({ message: safeErrorMessage(error) });
  }
}