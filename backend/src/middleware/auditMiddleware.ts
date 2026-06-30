import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
import { prisma } from "../prisma.js";

export function auditMiddleware(action: string, entity?: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const oldJson = res.json;

    res.json = function (data) {
      const userId = req.user?.id;
      const schoolId = req.schoolId;

      // 🔥 ONLY LOG IF REQUIRED DATA EXISTS
      if (userId && schoolId) {
        prisma.auditLog
          .create({
            data: {
              userId,
              schoolId,
              action,
              entity,
              metadata: {
                method: req.method,
                path: req.originalUrl,
                body: req.body,
              },
            },
          })
          .catch(() => {
            // silent fail (never break API)
          });
      }

      return oldJson.call(this, data);
    };

    next();
  };
}