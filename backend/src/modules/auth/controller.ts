import type { Request, Response } from "express";

import { prisma } from "../../prisma.js";
import bcrypt from "bcrypt";
import { signToken } from "../../utils/jwt.js";
import { logAction } from "../audit/service.js";
import { AuditActions } from "../audit/actions.js";
import { safeErrorMessage } from "../../utils/errorResponse.js";

/**
 * 🔥 FULL LOGIN CONTROLLER (WITH AUDIT)
 */
export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      schoolId: user.schoolId,
      role: user.role?.name,
    });

    // 🔥 AUDIT LOGIN EVENT
    await logAction({
      userId: user.id,
      schoolId: user.schoolId,
      action: AuditActions.LOGIN,
      entity: "Auth",
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name,
      },
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ message: safeErrorMessage(error) });
  }
}