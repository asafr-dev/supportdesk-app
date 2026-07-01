import { z } from "zod";

/**
 * Small helpers for server actions:
 * - keep FormData extraction consistent
 * - keep Zod error messages consistent
 */
export function pickFormStrings(formData: FormData, keys: readonly string[]) {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = String(formData.get(k) ?? "");
  return out;
}

export function firstZodIssueMessage(error: z.ZodError, fallback = "Invalid input") {
  return error.issues[0]?.message ?? fallback;
}

export function parseWithSchema<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  raw: unknown,
  fallback = "Invalid input"
): { ok: true; data: z.infer<TSchema> } | { ok: false; error: string } {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstZodIssueMessage(parsed.error, fallback) };
  return { ok: true, data: parsed.data };
}
