import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  delete process.env.AUTH_COOKIE_NAME;
  delete process.env.SESSION_TTL_HOURS;
  delete process.env.APP_URL;
  delete process.env.DEMO_PASSWORD;
  vi.resetModules();
});

describe("runtime + demo constants", () => {
  it("uses sane runtime defaults and env overrides", async () => {
    let runtime = await import("@/lib/runtime");
    expect(runtime.AUTH_COOKIE_NAME).toBe("sd_session");
    expect(runtime.SESSION_TTL_HOURS).toBe(72);
    expect(runtime.APP_URL).toBe("http://localhost:3000");

    process.env.AUTH_COOKIE_NAME = "custom_cookie";
    process.env.SESSION_TTL_HOURS = "24";
    process.env.APP_URL = "https://demo.example";
    vi.resetModules();

    runtime = await import("@/lib/runtime");
    expect(runtime.AUTH_COOKIE_NAME).toBe("custom_cookie");
    expect(runtime.SESSION_TTL_HOURS).toBe(24);
    expect(runtime.APP_URL).toBe("https://demo.example");
  });

  it("falls back when SESSION_TTL_HOURS is invalid and validates demo password", async () => {
    process.env.SESSION_TTL_HOURS = "-1";
    vi.resetModules();
    const runtime = await import("@/lib/runtime");
    expect(runtime.SESSION_TTL_HOURS).toBe(72);

    const demo = await import("../../demoEnv.mjs");
    expect(() => demo.requireDemoPassword()).toThrow(/Missing DEMO_PASSWORD/);
    process.env.DEMO_PASSWORD = "secret";
    expect(demo.requireDemoPassword()).toBe("secret");

    const emails = await import("@/lib/demo");
    expect(emails.DEMO_EMAIL_DOMAIN).toBe("demo.test");
    expect(emails.DEMO_ADMIN_EMAIL).toBe("admin@demo.test");
    expect(emails.DEMO_AGENT_EMAIL).toBe("agent@demo.test");
    expect(emails.DEMO_USER_EMAIL).toBe("user@demo.test");
  });
});
