import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { APP_URL } from "./src/lib/runtime";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? APP_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL
  },
  webServer: {
    // Seed/reset DB before starting the app so the smoke test can log in.
    command: "npm run db:wait && npm run db:reset && npm run dev -- --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
