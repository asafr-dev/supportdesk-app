import { describe, it, expect } from "vitest";
import { createTicketInput, commentInput } from "@/lib/validators";

describe("input validators", () => {
  it("accepts valid create ticket input and defaults description", () => {
    const parsed = createTicketInput.parse({ title: "Login issue" });
    expect(parsed.title).toBe("Login issue");
    expect(parsed.description).toBe("");
  });

  it("rejects too-short titles", () => {
    const r = createTicketInput.safeParse({ title: "hi" });
    expect(r.success).toBe(false);
  });

  it("validates comment input (accepts non-empty, rejects empty)", () => {
    expect(commentInput.parse({ body: "Looking into this now." }).body).toBe(
      "Looking into this now."
    );

    const r = commentInput.safeParse({ body: "" });
    expect(r.success).toBe(false);
  });
});
