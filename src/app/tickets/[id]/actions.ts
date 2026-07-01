"use server";

import { requireUser } from "@/lib/auth";
import { commentInput, ticketStatusInput } from "@/lib/validators";
import { parseWithSchema, pickFormStrings } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { addComment, assignToMe, updateStatus } from "@/lib/ticketService";

type Result = { ok: true } | { ok: false; error: string };

export async function addCommentAction(ticketId: number, formData: FormData): Promise<Result> {
  const user = await requireUser();

  const raw = pickFormStrings(formData, ["body"] as const);
  const parsed = parseWithSchema(commentInput, raw);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const res = await addComment({ user, ticketId, body: parsed.data.body, via: "ui" });
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true };
}

export async function updateStatusAction(ticketId: number, formData: FormData): Promise<Result> {
  const actor = await requireUser();

  const raw = pickFormStrings(formData, ["status"] as const);
  const parsed = parseWithSchema(ticketStatusInput, raw.status, "Invalid status");
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const res = await updateStatus({ user: actor, ticketId, status: parsed.data, via: "ui" });
  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true };
}

export async function assignToMeAction(ticketId: number): Promise<Result> {
  const actor = await requireUser();

  const res = await assignToMe({ user: actor, ticketId, via: "ui" });
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true };
}
