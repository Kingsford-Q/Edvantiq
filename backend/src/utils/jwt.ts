// src/utils/jwt.ts

import jwt from "jsonwebtoken";

function resolveSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }

  console.warn(
    "⚠️  JWT_SECRET is not set — using an insecure development-only default. Set JWT_SECRET in .env."
  );
  return "dev_secret";
}

export const JWT_SECRET = resolveSecret();

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
