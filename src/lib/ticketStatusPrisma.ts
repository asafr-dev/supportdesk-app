import type { TicketStatus } from "@prisma/client";

import type { TicketStatusInput } from "@/lib/validators";

const PRISMA_TICKET_STATUS = {
  OPEN: "OPEN" as TicketStatus,
  IN_PROGRESS: "IN_PROGRESS" as TicketStatus,
  RESOLVED: "RESOLVED" as TicketStatus
} as const;

export function toPrismaTicketStatus(input: TicketStatusInput): TicketStatus {
  switch (input) {
    case "open":
      return PRISMA_TICKET_STATUS.OPEN;
    case "in_progress":
      return PRISMA_TICKET_STATUS.IN_PROGRESS;
    case "resolved":
      return PRISMA_TICKET_STATUS.RESOLVED;
  }
}

export function fromPrismaTicketStatus(status: TicketStatus): TicketStatusInput {
  switch (status) {
    case PRISMA_TICKET_STATUS.OPEN:
      return "open";
    case PRISMA_TICKET_STATUS.IN_PROGRESS:
      return "in_progress";
    case PRISMA_TICKET_STATUS.RESOLVED:
      return "resolved";
    default:
      throw new Error(`Unexpected Prisma ticket status: ${status}`);
  }
}
