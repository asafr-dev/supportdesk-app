import { z } from "zod";

/**
 * Canonical ticket-status values exposed to the UI/API.
 *
 * NOTE: Prisma uses enum *keys* (OPEN/IN_PROGRESS/RESOLVED) while the DB stores
 * mapped values (open/in_progress/resolved). We keep UI/API values aligned to
 * the DB (snake-case) for readability and stable URLs.
 */
export const TICKET_STATUS_VALUES = ["open", "in_progress", "resolved"] as const;

export const ticketStatusInput = z.enum(TICKET_STATUS_VALUES);
export type TicketStatusInput = z.infer<typeof ticketStatusInput>;

export type TicketStatusTone = "neutral" | "green" | "yellow" | "red";

export const TICKET_STATUS_OPTIONS: ReadonlyArray<{
  value: TicketStatusInput;
  label: string;
  tone: TicketStatusTone;
}> = [
  { value: "open", label: "Open", tone: "neutral" },
  { value: "in_progress", label: "In progress", tone: "yellow" },
  { value: "resolved", label: "Resolved", tone: "green" }
] as const;

export const createTicketInput = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().default("")
});

export const commentInput = z.object({
  body: z.string().min(1).max(5000)
});

export function ticketStatusLabel(status: TicketStatusInput): string {
  return TICKET_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function ticketStatusTone(status: TicketStatusInput): TicketStatusTone {
  return TICKET_STATUS_OPTIONS.find((o) => o.value === status)?.tone ?? "neutral";
}
