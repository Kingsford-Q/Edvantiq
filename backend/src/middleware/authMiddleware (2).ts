import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    schoolId: string;
    role?: string;
  };
  schoolId?: string;
}

// 👇 type guard
function isAuthPayload(payload: string | JwtPayload): payload is JwtPayload {
  return typeof payload !== "string";
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isAuthPayload(decoded)) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 🔥 SAFE CAST (now TS is happy)
    req.user = decoded as {
      id: string;
      email: string;
      schoolId: string;
      role?: string;
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}