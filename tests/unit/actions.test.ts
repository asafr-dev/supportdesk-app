import { beforeEach, describe, expect, it, vi } from "vitest";
const Role = { USER: "USER", AGENT: "AGENT", ADMIN: "ADMIN" } as const;

vi.mock("@prisma/client", () => ({ Role }));

const createSessionForUserMock = vi.fn();
const verifyPasswordMock = vi.fn();
const requireUserMock = vi.fn();
const createTicketMock = vi.fn();
const addCommentMock = vi.fn();
const updateStatusMock = vi.fn();
const assignToMeMock = vi.fn();
const parseWithSchemaMock = vi.fn();
const pickFormStringsMock = vi.fn();
const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
const revalidatePathMock = vi.fn();
const userUpdateMock = vi.fn();
const prismaMock = { user: { update: userUpdateMock } };

vi.mock("@/lib/auth", () => ({
  createSessionForUser: createSessionForUserMock,
  verifyPassword: verifyPasswordMock,
  requireUser: requireUserMock
}));
vi.mock("@/lib/forms", () => ({
  parseWithSchema: parseWithSchemaMock,
  pickFormStrings: pickFormStringsMock
}));
vi.mock("@/lib/ticketService", () => ({
  createTicket: createTicketMock,
  addComment: addCommentMock,
  updateStatus: updateStatusMock,
  assignToMe: assignToMeMock
}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

describe("server actions", () => {
  beforeEach(() => {
    vi.resetModules();
    createSessionForUserMock.mockReset();
    verifyPasswordMock.mockReset();
    requireUserMock.mockReset();
    createTicketMock.mockReset();
    addCommentMock.mockReset();
    updateStatusMock.mockReset();
    assignToMeMock.mockReset();
    parseWithSchemaMock.mockReset();
    pickFormStringsMock.mockReset();
    redirectMock.mockClear();
    revalidatePathMock.mockReset();
    userUpdateMock.mockReset();
  });

  it("covers loginAction validation, bad credentials, and safe redirects", async () => {
    const { loginAction } = await import("@/app/(auth)/login/actions");
    const fd = new FormData();

    pickFormStringsMock.mockReturnValueOnce({ email: "bad", password: "short", next: "" });
    parseWithSchemaMock.mockReturnValueOnce({ ok: false, error: "Invalid input." });
    await expect(loginAction({ error: null }, fd)).resolves.toEqual({ error: "Invalid input." });

    pickFormStringsMock.mockReturnValueOnce({
      email: "user@test",
      password: "secret1",
      next: "/tickets"
    });
    parseWithSchemaMock.mockReturnValueOnce({
      ok: true,
      data: { email: "user@test", password: "secret1", next: "/tickets" }
    });
    verifyPasswordMock.mockResolvedValueOnce(null);
    await expect(loginAction({ error: null }, fd)).resolves.toEqual({
      error: "Invalid email or password."
    });

    pickFormStringsMock.mockReturnValueOnce({
      email: "user@test",
      password: "secret1",
      next: "//evil.com"
    });
    parseWithSchemaMock.mockReturnValueOnce({
      ok: true,
      data: { email: "user@test", password: "secret1", next: "//evil.com" }
    });
    verifyPasswordMock.mockResolvedValueOnce({ id: "u1" });
    await expect(loginAction({ error: null }, fd)).rejects.toThrow("REDIRECT:/dashboard");
    expect(createSessionForUserMock).toHaveBeenCalledWith("u1");
  });

  it("covers admin/user ticket actions happy + error branches", async () => {
    const { setUserRoleAction } = await import("@/app/admin/users/actions");
    const { createTicketAction } = await import("@/app/tickets/actions");
    const { addCommentAction, updateStatusAction, assignToMeAction } =
      await import("@/app/tickets/[id]/actions");
    const fd = new FormData();

    requireUserMock.mockResolvedValueOnce({ id: "u1", role: Role.USER });
    await expect(setUserRoleAction(fd)).rejects.toThrow("FORBIDDEN");

    requireUserMock.mockResolvedValueOnce({ id: "u2", role: Role.ADMIN });
    pickFormStringsMock.mockReturnValueOnce({ userId: "u2", role: Role.USER });
    parseWithSchemaMock.mockReturnValueOnce({ ok: true, data: { userId: "u2", role: Role.USER } });
    await expect(setUserRoleAction(fd)).rejects.toThrow("REDIRECT:/admin/users");

    requireUserMock.mockResolvedValueOnce({ id: "u2", role: Role.ADMIN });
    pickFormStringsMock.mockReturnValueOnce({ userId: "u3", role: Role.AGENT });
    parseWithSchemaMock.mockReturnValueOnce({ ok: true, data: { userId: "u3", role: Role.AGENT } });
    await expect(setUserRoleAction(fd)).rejects.toThrow("REDIRECT:/admin/users");
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "u3" },
      data: { role: Role.AGENT }
    });

    requireUserMock.mockResolvedValueOnce({ id: "u4", role: Role.USER });
    pickFormStringsMock.mockReturnValueOnce({ title: "x", description: "" });
    parseWithSchemaMock.mockReturnValueOnce({ ok: false, error: "Bad title" });
    await expect(createTicketAction({ error: null }, fd)).resolves.toEqual({ error: "Bad title" });

    requireUserMock.mockResolvedValueOnce({ id: "u4", role: Role.USER });
    pickFormStringsMock.mockReturnValueOnce({ title: "Good title", description: "Help" });
    parseWithSchemaMock.mockReturnValueOnce({
      ok: true,
      data: { title: "Good title", description: "Help" }
    });
    createTicketMock.mockResolvedValueOnce({ ok: false, error: "Boom" });
    await expect(createTicketAction({ error: null }, fd)).resolves.toEqual({ error: "Boom" });

    requireUserMock.mockResolvedValueOnce({ id: "u4", role: Role.USER });
    pickFormStringsMock.mockReturnValueOnce({ title: "Good title", description: "Help" });
    parseWithSchemaMock.mockReturnValueOnce({
      ok: true,
      data: { title: "Good title", description: "Help" }
    });
    createTicketMock.mockResolvedValueOnce({ ok: true, data: { id: 77 } });
    await expect(createTicketAction({ error: null }, fd)).rejects.toThrow("REDIRECT:/tickets/77");

    requireUserMock.mockResolvedValueOnce({ id: "u5", role: Role.USER });
    pickFormStringsMock.mockReturnValueOnce({ body: "" });
    parseWithSchemaMock.mockReturnValueOnce({ ok: false, error: "Comment required" });
    await expect(addCommentAction(7, fd)).resolves.toEqual({
      ok: false,
      error: "Comment required"
    });

    requireUserMock.mockResolvedValueOnce({ id: "u5", role: Role.USER });
    pickFormStringsMock.mockReturnValueOnce({ body: "hello" });
    parseWithSchemaMock.mockReturnValueOnce({ ok: true, data: { body: "hello" } });
    addCommentMock.mockResolvedValueOnce({ ok: true });
    await expect(addCommentAction(7, fd)).resolves.toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/tickets/7");

    requireUserMock.mockResolvedValueOnce({ id: "u6", role: Role.AGENT });
    pickFormStringsMock.mockReturnValueOnce({ status: "bad" });
    parseWithSchemaMock.mockReturnValueOnce({ ok: false, error: "Invalid status" });
    await expect(updateStatusAction(8, fd)).resolves.toEqual({
      ok: false,
      error: "Invalid status"
    });

    requireUserMock.mockResolvedValueOnce({ id: "u6", role: Role.AGENT });
    pickFormStringsMock.mockReturnValueOnce({ status: "resolved" });
    parseWithSchemaMock.mockReturnValueOnce({ ok: true, data: "resolved" });
    updateStatusMock.mockResolvedValueOnce({ ok: true });
    await expect(updateStatusAction(8, fd)).resolves.toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/tickets/8");

    requireUserMock.mockResolvedValueOnce({ id: "u6", role: Role.AGENT });
    assignToMeMock.mockResolvedValueOnce({ ok: false, error: "Forbidden" });
    await expect(assignToMeAction(9)).resolves.toEqual({ ok: false, error: "Forbidden" });

    requireUserMock.mockResolvedValueOnce({ id: "u6", role: Role.AGENT });
    assignToMeMock.mockResolvedValueOnce({ ok: true });
    await expect(assignToMeAction(9)).resolves.toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/tickets/9");
  });
});
