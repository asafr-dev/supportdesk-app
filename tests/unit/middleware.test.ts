import { describe, expect, it, vi } from "vitest";

const nextMock = vi.fn(() => ({ kind: "next" }));
const redirectMock = vi.fn((url: URL) => ({ kind: "redirect", url: url.toString() }));

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextMock,
    redirect: redirectMock
  }
}));

describe("middleware", () => {
  it("passes through public routes and authenticated protected routes, and redirects anonymous users", async () => {
    const { middleware, config } = await import("@/middleware");

    expect(
      middleware({
        nextUrl: {
          pathname: "/login"
        },
        cookies: { get: vi.fn() }
      } as never)
    ).toEqual({ kind: "next" });

    const protectedUrl = new URL("http://localhost/tickets/7");
    expect(
      middleware({
        nextUrl: {
          pathname: protectedUrl.pathname,
          clone: () => new URL(protectedUrl.toString())
        },
        cookies: { get: vi.fn(() => undefined) }
      } as never)
    ).toEqual({ kind: "redirect", url: "http://localhost/login?next=%2Ftickets%2F7" });

    expect(
      middleware({
        nextUrl: {
          pathname: "/dashboard"
        },
        cookies: { get: vi.fn(() => ({ value: "token" })) }
      } as never)
    ).toEqual({ kind: "next" });

    expect(config.matcher).toEqual(["/dashboard/:path*", "/tickets/:path*"]);
  });
});
