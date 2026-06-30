/**
 * Returns a message safe to send to API clients. Internal/Prisma errors can
 * include file paths, stack frames and schema details (we've seen this:
 * "Invalid `prisma.user.create()` invocation in D:\...\controller.ts:20:41 ...").
 * Those get logged server-side and replaced with a generic message; our own
 * intentionally-thrown `Error("Student not found")`-style messages are safe
 * to pass straight through.
 */
export function safeErrorMessage(error: any): string {
  const message = typeof error?.message === "string" ? error.message : String(error);

  const looksInternal =
    error?.name?.startsWith("Prisma") ||
    message.includes("Invalid `prisma.") ||
    message.includes(".prisma\\schema.prisma") ||
    /[A-Za-z]:\\|\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.ts/.test(message);

  if (looksInternal) {
    console.error(error);
    return "Something went wrong. Please try again.";
  }

  return message;
}
