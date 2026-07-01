/**
 * ID parsing helpers shared across server components and API routes.
 *
 * Centralizing this avoids subtle drift (e.g., Number() vs parseInt(), error messages).
 */
export function parseIntId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export function assertIntId(idParam: string, message = "Invalid id"): number {
  const id = parseIntId(idParam);
  if (id === null) throw new Error(message);
  return id;
}
