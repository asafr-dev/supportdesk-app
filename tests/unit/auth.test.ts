import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieGetMock = vi.fn();
const cookieSetMock = vi.fn();
const cookieDeleteMock = vi.fn();
const cookiesMock = vi.fn(async () => ({
  get: cookieGetMock,
  set: cookieSetMock,
  delete: cookieDeleteMock
}));
const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
const compareMock = vi.fn();
const randomBytesMock = vi.fn(() => Buffer.from("abcd"));
const sessionCreateMock = vi.fn();
const sessionDeleteManyMock = vi.fn();
const sessionFindUniqueMock = vi.fn();
const sessionDeleteMock = vi.fn();
const userFindUniqueMock = vi.fn();

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("bcryptjs", () => ({ default: { compare: compareMock } }));
vi.mock("crypto", () => ({ default: { randomBytes: randomBytesMock } }));
vi.mock("@/lib/db", () => ({
  prisma: {
    session: {
      create: sessionCreateMock,
      deleteMany: sessionDeleteManyMock,
      findUnique: sessionFindUniqueMock,
      delete: sessionDeleteMock
    },
    user: {
      findUnique: userFindUniqueMock
    }
  }
}));
vi.mock("@prisma/client", () => ({ Role: { USER: "USER", AGENT: "AGENT", ADMIN: "ADMIN" } }));

describe("auth", () => {
  beforeEach(() => {
    vi.resetModules();
    cookieGetMock.mockReset();
    cookieSetMock.mockReset();
    cookieDeleteMock.mockReset();
    cookiesMock.mockClear();
    redirectMock.mockClear();
    compareMock.mockReset();
    randomBytesMock.mockClear();
    sessionCreateMock.mockReset();
    sessionDeleteManyMock.mockReset();
    sessionFindUniqueMock.mockReset();
    sessionDeleteMock.mockReset();
    sessionDeleteMock.mockResolvedValue(undefined);
    userFindUniqueMock.mockReset();
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.AUTH_COOKIE_NAME;
    delete process.env.SESSION_TTL_HOURS;
  });

  it("creates and clears sessions", async () => {
    const auth = await import("@/lib/auth");
    await auth.createSessionForUser("user_1");
    expect(sessionCreateMock).toHaveBeenCalled();
    expect(cookieSetMock).toHaveBeenCalledWith(
      "sd_session",
      Buffer.from("abcd").toString("hex"),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", secure: false })
    );

    cookieGetMock.mockReturnValue({ value: "token-1" });
    await auth.clearSession();
    expect(sessionDeleteManyMock).toHaveBeenCalledWith({ where: { token: "token-1" } });
    expect(cookieDeleteMock).toHaveBeenCalledWith("sd_session");
  });

  it("gets session users, expires old sessions, enforces roles, and verifies passwords", async () => {
    const auth = await import("@/lib/auth");

    cookieGetMock.mockReturnValueOnce(undefined);
    expect(await auth.getSessionUser()).toBeNull();

    cookieGetMock.mockReturnValue({ value: "token-2" });
    sessionFindUniqueMock.mockResolvedValueOnce(null);
    expect(await auth.getSessionUser()).toBeNull();

    sessionFindUniqueMock.mockResolvedValueOnce({
      id: "s1",
      expiresAt: new Date(Date.now() - 1000),
      user: { id: "u1", role: "USER" }
    });
    expect(await auth.getSessionUser()).toBeNull();
    expect(sessionDeleteMock).toHaveBeenCalledWith({ where: { id: "s1" } });

    const liveUser = { id: "u2", role: "ADMIN" };
    sessionFindUniqueMock.mockResolvedValueOnce({
      id: "s2",
      expiresAt: new Date(Date.now() + 60_000),
      user: liveUser
    });
    expect(await auth.getSessionUser()).toEqual(liveUser);

    expect(auth.hasRole("ADMIN", ["ADMIN"] as never[])).toBe(true);
    expect(auth.hasRole("USER", ["ADMIN"] as never[])).toBe(false);

    sessionFindUniqueMock.mockResolvedValueOnce(null);
    await expect(auth.requireUser()).rejects.toThrow("REDIRECT:/login");

    sessionFindUniqueMock.mockResolvedValueOnce({
      id: "s3",
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: "u3", role: "USER" }
    });
    await expect(auth.requireRole(["ADMIN"] as never[])).rejects.toThrow("FORBIDDEN");

    userFindUniqueMock.mockResolvedValueOnce({ id: "u4", email: "x@test", passwordHash: null });
    expect(await auth.verifyPassword("x@test", "pw")).toBeNull();

    userFindUniqueMock.mockResolvedValueOnce({ id: "u5", email: "x@test", passwordHash: "hash" });
    compareMock.mockResolvedValueOnce(false);
    expect(await auth.verifyPassword("x@test", "pw")).toBeNull();

    const verified = { id: "u6", email: "ok@test", passwordHash: "hash" };
    userFindUniqueMock.mockResolvedValueOnce(verified);
    compareMock.mockResolvedValueOnce(true);
    expect(await auth.verifyPassword("ok@test", "pw")).toEqual(verified);
  });
});
