import { describe, it, expect } from "vitest";
import { createTicketInput, commentInput } from "@/lib/validators";

describe("validator limits", () => {
  it("enforces max lengths (title <= 200, description <= 5000)", () => {
    const tooLongTitle = "a".repeat(201);
    const r1 = createTicketInput.safeParse({ title: tooLongTitle });
    expect(r1.success).toBe(false);

    const ok = createTicketInput.safeParse({
      title: "a".repeat(200),
      description: "b".repeat(5000)
    });
    expect(ok.success).toBe(true);

    const tooLongDesc = "b".repeat(5001);
    const r2 = createTicketInput.safeParse({ title: "Valid title", description: tooLongDesc });
    expect(r2.success).toBe(false);
  });

  it("enforces max length for comments (<= 5000)", () => {
    const ok = commentInput.safeParse({ body: "x".repeat(5000) });
    expect(ok.success).toBe(true);

    const tooLong = commentInput.safeParse({ body: "x".repeat(5001) });
    expect(tooLong.success).toBe(false);
  });
});
