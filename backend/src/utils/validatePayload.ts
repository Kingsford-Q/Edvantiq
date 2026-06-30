export function validateRequired(
  data: Record<string, any>,
  fields: string[]
) {
  const missing: string[] = [];

  for (const field of fields) {
    const value = data[field];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required fields: ${missing.join(", ")}`
    );
  }
}