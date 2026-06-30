import type { Request, Response, NextFunction } from "express";
import { hasPermission } from "../rbac/hasPermission.js";

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user?.role?.name) {
      return res.status(403).json({ message: "No role found" });
    }

    const allowed = hasPermission(user.role.name, permission);

    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
}