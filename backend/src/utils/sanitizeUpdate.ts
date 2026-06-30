/**
 * Strips fields a client must never be able to set directly on an update,
 * since update bodies are otherwise passed straight through to Prisma.
 * Without this, a caller could include "schoolId" in a PUT body and
 * reassign a record to a different tenant.
 *
 * Pass `allowedFields` to additionally whitelist a model's real columns —
 * useful for models like Student/Teacher where a stray field from a related
 * resource (e.g. "classId") would otherwise reach Prisma and crash with an
 * opaque "unknown argument" error instead of being silently dropped.
 */
const PROTECTED_FIELDS = ["id", "schoolId", "createdAt", "updatedAt"];

export function sanitizeUpdate(body: Record<string, any>, allowedFields?: string[]): any {
  const clean: Record<string, any> = { ...body };
  for (const field of PROTECTED_FIELDS) {
    delete clean[field];
  }
  if (allowedFields) {
    for (const field of Object.keys(clean)) {
      if (!allowedFields.includes(field)) {
        delete clean[field];
      }
    }
  }
  return clean;
}
