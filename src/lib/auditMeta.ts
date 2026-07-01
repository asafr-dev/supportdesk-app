import type { TicketStatusInput } from "@/lib/validators";

/**
 * Audit-log meta helpers.
 *
 * Goal: keep status representation consistent (snake-case) and avoid
 * ambiguous keys like `to` (could be a status OR a user id).
 */
export type AuditVia = "ui" | "seed";

export function auditMetaTicketCreated(args: { via: AuditVia; status: TicketStatusInput }) {
  return { via: args.via, status: args.status } as const;
}

export function auditMetaCommentCreated(args: { via: AuditVia; commentId: number }) {
  return { via: args.via, commentId: args.commentId } as const;
}

export function auditMetaTicketAssigned(args: { via: AuditVia; assigneeId: string }) {
  return { via: args.via, assigneeId: args.assigneeId } as const;
}

export function auditMetaTicketStatusChanged(args: {
  via: AuditVia;
  from: TicketStatusInput;
  to: TicketStatusInput;
}) {
  return { via: args.via, status: { from: args.from, to: args.to } } as const;
}
