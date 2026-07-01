"use server";

import { z } from "zod";
import { createSessionForUser, verifyPassword } from "@/lib/auth";
import { parseWithSchema, pickFormStrings } from "@/lib/forms";
import { redirect } from "next/navigation";

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  next: z.string().optional().default("/dashboard")
});

type State = { error: string | null };

function safeNext(next: string) {
  // Only allow internal relative redirects
  if (!next.startsWith("/")) return "/dashboard";
  // prevent open redirects like //evil.com
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const raw = pickFormStrings(formData, ["email", "password", "next"] as const);
  if (!raw.next) raw.next = "/dashboard";

  const parsed = parseWithSchema(loginInput, raw, "Invalid input.");
  if (!parsed.ok) return { error: parsed.error };

  const user = await verifyPassword(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Invalid email or password." };

  await createSessionForUser(user.id);
  redirect(safeNext(parsed.data.next));
}
