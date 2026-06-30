import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";


export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user || user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Super Admin only access",
    });
  }

  next();
}