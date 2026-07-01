import { beforeEach, describe, expect, it, vi } from "vitest";

const auditCreateMock = vi.fn();
const sessionCreateMock = vi.fn();
const sessionDeleteManyMock = vi.fn();
const sessionFindUniqueMock = vi.fn();
const sessionDeleteMock = vi.fn();
const userFindUniqueMock = vi.fn();
const prismaCtorMock = vi.fn();

vi.mock("@prisma/client", () => {
  class PrismaClient {
    auditLog = { create: auditCreateMock };
    session = {
      create: sessionCreateMock,
      deleteMany: sessionDeleteManyMock,
      findUnique: sessionFindUniqueMock,
      delete: sessionDeleteMock
    };
    user = { findUnique: userFindUniqueMock };
    constructor(...args: unknown[]) {
      prismaCtorMock(...args);
    }
  }

  return {
    PrismaClient,
    Role: { USER: "USER", AGENT: "AGENT", ADMIN: "ADMIN" }
  };
});

describe("audit/db wiring", () => {
  beforeEach(() => {
    delete (globalThis as { prisma?: unknown }).prisma;
    auditCreateMock.mockReset();
    sessionCreateMock.mockReset();
    sessionDeleteManyMock.mockReset();
    sessionFindUniqueMock.mockReset();
    sessionDeleteMock.mockReset();
    userFindUniqueMock.mockReset();
    prismaCtorMock.mockReset();
    vi.resetModules();
  });

  it("creates audit rows via prisma", async () => {
    const { audit } = await import("@/lib/audit");
    await audit(7, "user_1", "ticket.created", { via: "ui" });
    expect(auditCreateMock).toHaveBeenCalledWith({
      data: {
        ticketId: 7,
        actorId: "user_1",
        action: "ticket.created",
        meta: { via: "ui" }
      }
    });
  });

  it("builds prisma with placeholder DATABASE_URL and caches outside production", async () => {
    delete process.env.DATABASE_URL;
    vi.stubEnv("NODE_ENV", "test");
    const db1 = await import("@/lib/db");
    const db2 = await import("@/lib/db");

    expect(prismaCtorMock).toHaveBeenCalledTimes(1);
    expect(prismaCtorMock.mock.calls[0]?.[0]).toEqual({
      log: ["error", "warn"],
      datasources: { db: { url: "postgresql://db.invalid:5432/invalid?schema=public" } }
    });
    expect(db1.prisma).toBe(db2.prisma);
  });
});
