export const AUDIT_ACTIONS = {
  TICKET_CREATED: "ticket.created",
  TICKET_ASSIGNED: "ticket.assigned",
  TICKET_STATUS_CHANGED: "ticket.status_changed",
  COMMENT_CREATED: "comment.created"
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
