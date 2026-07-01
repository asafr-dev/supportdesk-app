/**
 * Demo-only env helpers that must be runnable in plain Node (e.g. next.config).
 */

export function requireDemoPassword() {
  const v = (process.env.DEMO_PASSWORD ?? "").trim();
  if (!v) {
    throw new Error(
      "Missing DEMO_PASSWORD. Copy .env.example to .env and set DEMO_PASSWORD (demo only)."
    );
  }
  return v;
}
