import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { hasPermission } from "../rbac/hasPermission.js"; // Ensure this import is correct

/**
 * Refactored RBAC middleware.
 * Uses the role stored in the JWT to check permissions, avoiding extra DB calls.
 */
export function rbac(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "SUPER_ADMIN" || hasPermission(user.role, permission)) {
      return next();
    }

    return res.status(403).json({
      message: `Forbidden: Missing required permission: ${permission}`,
    });
  };
}