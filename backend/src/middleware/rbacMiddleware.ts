import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";

/**
 * Role-based access middleware.
 * Restricts a route to the given set of roles (SUPER_ADMIN always allowed).
 */
export function rbac(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "SUPER_ADMIN" || allowedRoles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({
      message: `Forbidden: requires one of roles: ${allowedRoles.join(", ")}`,
    });
  };
}