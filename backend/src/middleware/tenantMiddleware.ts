import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { validateSuperAdminAccess } from "../modules/accessRequests/guard.js";

export async function tenantMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // =========================
    // SUPER ADMIN FLOW
    // =========================
    if (user.role === "SUPER_ADMIN") {
      const schoolId = req.headers["x-school-id"] as string;

      if (!schoolId) {
        return res.status(400).json({
          message: "Super Admin must specify x-school-id",
        });
      }

      const allowed = await validateSuperAdminAccess(user.id, schoolId);

      if (!allowed) {
        return res.status(403).json({
          message: "No approved access for this school",
        });
      }

      req.schoolId = schoolId;
      return next();
    }

    // =========================
    // NORMAL USERS (NO ACCESS REQUEST LOGIC HERE)
    // =========================
    if (!user.schoolId) {
      return res.status(401).json({
        message: "Unauthorized - missing tenant",
      });
    }

    req.schoolId = user.schoolId;

    return next();
  } catch (err) {
    return res.status(500).json({
      message: "Tenant middleware error",
    });
  }
}