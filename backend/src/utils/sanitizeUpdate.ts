/**
 * Strips fields a client must never be able to set directly on an update,
 * since update bodies are otherwise passed straight through to Prisma.
 * Without this, a caller could include "schoolId" in a PUT body and
 * reassign a record to a different tenant.
 */
const PROTECTED_FIELDS = ["id", "schoolId", "createdAt", "updatedAt"];

export function sanitizeUpdate(body: Record<string, any>): any {
  const clean: Record<string, any> = { ...body };
  for (const field of PROTECTED_FIELDS) {
    delete clean[field];
  }
  return clean;
}
