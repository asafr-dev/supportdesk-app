"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createTicketInput } from "@/lib/validators";
import { parseWithSchema, pickFormStrings } from "@/lib/forms";
import { createTicket } from "@/lib/ticketService";

type State = { error: string | null };

export async function createTicketAction(_prev: State, formData: FormData): Promise<State> {
  const user = await requireUser();

  const raw = pickFormStrings(formData, ["title", "description"] as const);

  const parsed = parseWithSchema(createTicketInput, raw);
  if (!parsed.ok) return { error: parsed.error };

  const res = await createTicket({
    user,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    via: "ui"
  });
  if (!res.ok) return { error: res.error };

  redirect(`/tickets/${res.data.id}`);
}
