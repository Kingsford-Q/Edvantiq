import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { prisma } from "../prisma.js";

export function rbac(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      const roleName = dbUser?.role?.name;

      if (!roleName || !allowedRoles.includes(roleName)) {
        return res.status(403).json({
          message: "Forbidden - insufficient permissions",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "RBAC check failed",
      });
    }
  };
}