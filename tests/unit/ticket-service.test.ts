import { beforeEach, describe, expect, it, vi } from "vitest";
const Role = { USER: "USER", AGENT: "AGENT", ADMIN: "ADMIN" } as const;

const findManyMock = vi.fn();
const findUniqueMock = vi.fn();
const countMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const commentCreateMock = vi.fn();
const auditMock = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    ticket: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      count: countMock,
      create: createMock,
      update: updateMock
    },
    comment: {
      create: commentCreateMock
    }
  }
}));
vi.mock("@/lib/audit", () => ({ audit: auditMock }));
vi.mock("@prisma/client", () => ({ Role }));

describe("ticketService", () => {
  const user = { id: "u1", role: Role.USER };
  const agent = { id: "a1", role: Role.AGENT };

  beforeEach(() => {
    vi.resetModules();
    findManyMock.mockReset();
    findUniqueMock.mockReset();
    countMock.mockReset();
    createMock.mockReset();
    updateMock.mockReset();
    commentCreateMock.mockReset();
    auditMock.mockReset();
  });

  it("lists tickets with filters and counts by status", async () => {
    const svc = await import("@/lib/ticketService");
    findManyMock.mockResolvedValueOnce([{ id: 1, title: "Printer" }]);
    const list = await svc.listTickets({
      user,
      status: "open",
      q: "print",
      limit: 200,
      offset: -5
    });
    expect(list).toEqual({ ok: true, data: [{ id: 1, title: "Printer" }] });
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          requesterId: "u1",
          status: "OPEN",
          title: { contains: "print", mode: "insensitive" }
        },
        take: 100,
        skip: 0
      })
    );

    countMock
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    const counts = await svc.countTicketsByStatus({ user });
    expect(counts).toEqual({
      ok: true,
      data: { total: 3, byStatus: { open: 1, in_progress: 1, resolved: 1 } }
    });
  });

  it("handles getTicketById/getTicketDetail 404, 403, and success", async () => {
    const svc = await import("@/lib/ticketService");
    findUniqueMock.mockResolvedValueOnce(null);
    expect(await svc.getTicketById({ user, id: 1 })).toEqual({
      ok: false,
      status: 404,
      error: "Not found"
    });

    findUniqueMock.mockResolvedValueOnce({ requesterId: "other" });
    expect(await svc.getTicketById({ user, id: 2 })).toEqual({
      ok: false,
      status: 403,
      error: "Forbidden"
    });

    findUniqueMock.mockResolvedValueOnce({ id: 3, requesterId: "u1", title: "Mine" });
    expect(await svc.getTicketById({ user, id: 3 })).toEqual({
      ok: true,
      data: { id: 3, requesterId: "u1", title: "Mine" }
    });

    findUniqueMock.mockResolvedValueOnce(null);
    expect(await svc.getTicketDetail({ user, id: 4 })).toEqual({
      ok: false,
      status: 404,
      error: "Ticket not found"
    });

    findUniqueMock.mockResolvedValueOnce({ requesterId: "other" });
    expect(await svc.getTicketDetail({ user, id: 5 })).toEqual({
      ok: false,
      status: 403,
      error: "Forbidden"
    });

    const detail = { id: 6, requesterId: "other", title: "Agent can see" };
    findUniqueMock.mockResolvedValueOnce(detail);
    expect(await svc.getTicketDetail({ user: agent, id: 6 })).toEqual({ ok: true, data: detail });
  });

  it("creates tickets/comments and enforces comment/status/assignment permissions", async () => {
    const svc = await import("@/lib/ticketService");

    createMock.mockResolvedValueOnce({ id: 7, status: "OPEN", requesterId: "u1" });
    expect(await svc.createTicket({ user, title: "New", description: "Desc", via: "ui" })).toEqual({
      ok: true,
      data: { id: 7, status: "OPEN", requesterId: "u1" }
    });
    expect(auditMock).toHaveBeenCalled();

    findUniqueMock.mockResolvedValueOnce(null);
    expect(await svc.addComment({ user, ticketId: 8, body: "Hi", via: "ui" })).toEqual({
      ok: false,
      status: 404,
      error: "Ticket not found"
    });

    findUniqueMock.mockResolvedValueOnce({ requesterId: "other" });
    expect(await svc.addComment({ user, ticketId: 8, body: "Hi", via: "ui" })).toEqual({
      ok: false,
      status: 403,
      error: "Forbidden"
    });

    findUniqueMock.mockResolvedValueOnce({ requesterId: "u1" });
    commentCreateMock.mockResolvedValueOnce({
      id: 9,
      body: "Hi",
      createdAt: new Date().toISOString()
    });
    expect(await svc.addComment({ user, ticketId: 8, body: "Hi", via: "ui" })).toEqual({
      ok: true,
      data: expect.objectContaining({ id: 9, body: "Hi" })
    });

    expect(await svc.updateStatus({ user, ticketId: 10, status: "resolved", via: "ui" })).toEqual({
      ok: false,
      status: 403,
      error: "Forbidden"
    });

    findUniqueMock.mockResolvedValueOnce(null);
    expect(
      await svc.updateStatus({ user: agent, ticketId: 10, status: "resolved", via: "ui" })
    ).toEqual({
      ok: false,
      status: 404,
      error: "Ticket not found"
    });

    findUniqueMock.mockResolvedValueOnce({ status: "OPEN" });
    updateMock.mockResolvedValueOnce({ id: 10, status: "RESOLVED", requesterId: "u1" });
    expect(
      await svc.updateStatus({ user: agent, ticketId: 10, status: "resolved", via: "ui" })
    ).toEqual({
      ok: true,
      data: { id: 10, status: "RESOLVED", requesterId: "u1" }
    });

    expect(await svc.assignToMe({ user, ticketId: 11, via: "ui" })).toEqual({
      ok: false,
      status: 403,
      error: "Forbidden"
    });

    findUniqueMock.mockResolvedValueOnce(null);
    expect(await svc.assignToMe({ user: agent, ticketId: 11, via: "ui" })).toEqual({
      ok: false,
      status: 404,
      error: "Ticket not found"
    });

    findUniqueMock.mockResolvedValueOnce({ assigneeId: null });
    updateMock.mockResolvedValueOnce({});
    expect(await svc.assignToMe({ user: agent, ticketId: 11, via: "ui" })).toEqual({
      ok: true,
      data: {}
    });
  });
});
