import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { hasPermission } from "../rbac/hasPermission.js";

export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user?.role) {
      return res.status(403).json({ message: "No role found" });
    }

    // Super Admin bypasses all specific permission checks
    if (user.role === "SUPER_ADMIN") return next();

    const allowed = hasPermission(user.role, permission);

    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
}