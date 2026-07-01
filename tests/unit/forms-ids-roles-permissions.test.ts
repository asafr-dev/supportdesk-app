import { describe, expect, it } from "vitest";
import { z } from "zod";
import { vi } from "vitest";
const { Role } = vi.hoisted(() => ({
  Role: { USER: "USER", AGENT: "AGENT", ADMIN: "ADMIN" } as const
}));
vi.mock("@prisma/client", () => ({ Role }));

import { firstZodIssueMessage, parseWithSchema, pickFormStrings } from "@/lib/forms";
import { assertIntId, parseIntId } from "@/lib/ids";
import {
  canAssignTicket,
  canCommentOnTicket,
  canEditTicketStatus,
  canViewTicket,
  isAdmin,
  isAgentOrAdmin,
  ticketWhereForUser
} from "@/lib/permissions";
import { ROLE_OPTIONS, ROLE_VALUES, roleLabel } from "@/lib/roles";

describe("forms + ids + roles + permissions", () => {
  it("extracts form strings and returns first zod issue / fallback", () => {
    const fd = new FormData();
    fd.set("title", "Printer");
    expect(pickFormStrings(fd, ["title", "missing"])).toEqual({ title: "Printer", missing: "" });

    const schema = z.object({ title: z.string().min(3, "Too short") });
    expect(parseWithSchema(schema, { title: "ok" }, "Fallback")).toEqual({
      ok: false,
      error: "Too short"
    });

    const result = parseWithSchema(schema, { title: "Great title" }, "Fallback");
    expect(result).toEqual({ ok: true, data: { title: "Great title" } });

    const custom = new z.ZodError([]);
    expect(firstZodIssueMessage(custom, "Fallback")).toBe("Fallback");
  });

  it("parses ids and throws on invalid ids", () => {
    expect(parseIntId("42")).toBe(42);
    expect(parseIntId("42.5")).toBeNull();
    expect(parseIntId("abc")).toBeNull();
    expect(assertIntId("7")).toBe(7);
    expect(() => assertIntId("oops", "Bad id")).toThrow("Bad id");
  });

  it("covers role labels and permission branches", () => {
    const user = { id: "u1", role: Role.USER };
    const agent = { id: "a1", role: Role.AGENT };
    const admin = { id: "ad1", role: Role.ADMIN };
    const ownTicket = { requesterId: "u1" };
    const otherTicket = { requesterId: "x" };

    expect(ROLE_VALUES).toEqual([Role.USER, Role.AGENT, Role.ADMIN]);
    expect(ROLE_OPTIONS.map((x) => x.value)).toEqual(ROLE_VALUES);
    expect(roleLabel(Role.ADMIN)).toBe("ADMIN");

    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(agent)).toBe(false);
    expect(isAgentOrAdmin(agent)).toBe(true);
    expect(isAgentOrAdmin(admin)).toBe(true);
    expect(isAgentOrAdmin(user)).toBe(false);

    expect(ticketWhereForUser(user)).toEqual({ requesterId: "u1" });
    expect(ticketWhereForUser(agent)).toEqual({});
    expect(ticketWhereForUser(admin)).toEqual({});

    expect(canViewTicket(user, ownTicket)).toBe(true);
    expect(canViewTicket(user, otherTicket)).toBe(false);
    expect(canViewTicket(agent, otherTicket)).toBe(true);
    expect(canEditTicketStatus(user)).toBe(false);
    expect(canEditTicketStatus(agent)).toBe(true);
    expect(canCommentOnTicket(user, ownTicket)).toBe(true);
    expect(canCommentOnTicket(user, otherTicket)).toBe(false);
    expect(canCommentOnTicket(admin, otherTicket)).toBe(true);
    expect(canAssignTicket(user)).toBe(false);
    expect(canAssignTicket(admin)).toBe(true);
  });
});
