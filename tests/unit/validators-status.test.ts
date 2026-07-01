import { describe, it, expect } from "vitest";

import { TICKET_STATUS_OPTIONS, ticketStatusInput, ticketStatusTone } from "@/lib/validators";
import { fromPrismaTicketStatus, toPrismaTicketStatus } from "@/lib/ticketStatusPrisma";

describe("ticket status mapping", () => {
  it("accepts allowed statuses and rejects invalid values", () => {
    expect(ticketStatusInput.parse("open")).toBe("open");
    expect(ticketStatusInput.parse("in_progress")).toBe("in_progress");
    expect(ticketStatusInput.parse("resolved")).toBe("resolved");

    const bad = ticketStatusInput.safeParse("closed");
    expect(bad.success).toBe(false);
  });

  it("keeps status options aligned (labels + tones)", () => {
    expect(TICKET_STATUS_OPTIONS.map((o) => o.value)).toEqual(["open", "in_progress", "resolved"]);
    expect(ticketStatusTone("open")).toBe("neutral");
    expect(ticketStatusTone("in_progress")).toBe("yellow");
    expect(ticketStatusTone("resolved")).toBe("green");
  });

  it("maps to/from Prisma enum keys without requiring the generated client at runtime", () => {
    expect(toPrismaTicketStatus("open")).toBe("OPEN");
    expect(toPrismaTicketStatus("in_progress")).toBe("IN_PROGRESS");
    expect(toPrismaTicketStatus("resolved")).toBe("RESOLVED");

    expect(fromPrismaTicketStatus("OPEN" as ReturnType<typeof toPrismaTicketStatus>)).toBe("open");
    expect(fromPrismaTicketStatus("IN_PROGRESS" as ReturnType<typeof toPrismaTicketStatus>)).toBe(
      "in_progress"
    );
    expect(fromPrismaTicketStatus("RESOLVED" as ReturnType<typeof toPrismaTicketStatus>)).toBe(
      "resolved"
    );
  });
});
