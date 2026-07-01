import { describe, it, expect } from "vitest";
import {
  auditMetaTicketAssigned,
  auditMetaTicketCreated,
  auditMetaTicketStatusChanged
} from "@/lib/auditMeta";

describe("audit meta helpers", () => {
  it("keeps created/status-change meta in canonical shape", () => {
    expect(auditMetaTicketCreated({ via: "ui", status: "open" })).toEqual({
      via: "ui",
      status: "open"
    });
  });

  it("wraps status changes under a single `status` key", () => {
    expect(auditMetaTicketStatusChanged({ via: "ui", from: "open", to: "resolved" })).toEqual({
      via: "ui",
      status: { from: "open", to: "resolved" }
    });
  });

  it("avoids ambiguous keys for assignment", () => {
    expect(auditMetaTicketAssigned({ via: "ui", assigneeId: "user_123" })).toEqual({
      via: "ui",
      assigneeId: "user_123"
    });
  });
});
