import { describe, expect, it } from "vitest";

import { AUDIT_ACTIONS } from "@/lib/auditActions";
import {
  auditMetaCommentCreated,
  auditMetaTicketAssigned,
  auditMetaTicketCreated,
  auditMetaTicketStatusChanged
} from "@/lib/auditMeta";
import { clampPagination, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "@/lib/pagination";
import { fromPrismaTicketStatus, toPrismaTicketStatus } from "@/lib/ticketStatusPrisma";
import {
  TICKET_STATUS_OPTIONS,
  TICKET_STATUS_VALUES,
  commentInput,
  createTicketInput,
  ticketStatusInput,
  ticketStatusLabel,
  ticketStatusTone
} from "@/lib/validators";

describe("small library coverage gaps", () => {
  it("covers audit action constants and audit meta helpers", () => {
    expect(AUDIT_ACTIONS).toEqual({
      TICKET_CREATED: "ticket.created",
      TICKET_ASSIGNED: "ticket.assigned",
      TICKET_STATUS_CHANGED: "ticket.status_changed",
      COMMENT_CREATED: "comment.created"
    });

    expect(auditMetaTicketCreated({ via: "ui", status: "open" })).toEqual({
      via: "ui",
      status: "open"
    });
    expect(auditMetaCommentCreated({ via: "seed", commentId: 7 })).toEqual({
      via: "seed",
      commentId: 7
    });
    expect(auditMetaTicketAssigned({ via: "ui", assigneeId: "agent_1" })).toEqual({
      via: "ui",
      assigneeId: "agent_1"
    });
    expect(auditMetaTicketStatusChanged({ via: "seed", from: "open", to: "resolved" })).toEqual({
      via: "seed",
      status: { from: "open", to: "resolved" }
    });
  });

  it("covers pagination clamps and validator/fallback branches", () => {
    expect(clampPagination({ limit: Number.POSITIVE_INFINITY, offset: Number.NaN })).toEqual({
      limit: DEFAULT_PAGE_LIMIT,
      offset: 0
    });
    expect(clampPagination({ limit: 0, offset: -3 })).toEqual({ limit: 1, offset: 0 });
    expect(clampPagination({ limit: 999, offset: 2.9 })).toEqual({
      limit: MAX_PAGE_LIMIT,
      offset: 2
    });

    expect(TICKET_STATUS_VALUES).toEqual(["open", "in_progress", "resolved"]);
    expect(TICKET_STATUS_OPTIONS.map((x) => x.value)).toEqual(TICKET_STATUS_VALUES);
    expect(ticketStatusInput.parse("open")).toBe("open");
    expect(createTicketInput.safeParse({ title: "Great title", description: "Help" }).success).toBe(
      true
    );
    expect(createTicketInput.safeParse({ title: "no" }).success).toBe(false);
    expect(commentInput.safeParse({ body: "hello" }).success).toBe(true);
    expect(commentInput.safeParse({ body: "" }).success).toBe(false);
    expect(ticketStatusLabel("resolved")).toBe("Resolved");
    expect(ticketStatusTone("resolved")).toBe("green");
    expect(ticketStatusLabel("unknown" as never)).toBe("unknown");
    expect(ticketStatusTone("unknown" as never)).toBe("neutral");
  });

  it("covers Prisma ticket-status conversions and the default throw branch", () => {
    expect(toPrismaTicketStatus("open")).toBe("OPEN");
    expect(toPrismaTicketStatus("in_progress")).toBe("IN_PROGRESS");
    expect(toPrismaTicketStatus("resolved")).toBe("RESOLVED");

    expect(fromPrismaTicketStatus("OPEN" as never)).toBe("open");
    expect(fromPrismaTicketStatus("IN_PROGRESS" as never)).toBe("in_progress");
    expect(fromPrismaTicketStatus("RESOLVED" as never)).toBe("resolved");
    expect(() => fromPrismaTicketStatus("BROKEN" as never)).toThrow(
      /Unexpected Prisma ticket status/i
    );
  });
});
