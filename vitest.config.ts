import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Keep this aligned with tsconfig.json: "@/*" -> "./src/*"
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**", ".next/**"],
    coverage: {
      // Restrict unit-test coverage to TypeScript modules that Vitest can parse
      // reliably in this repo. Next.js route/component TSX files are exercised via
      // E2E, and including them here triggers noisy Rolldown parse errors for
      // uncovered files in Vitest v4 + V8 coverage.
      include: ["src/**/*.ts"],
      exclude: ["src/types/**/*.d.ts", "tests/**", "next-env.d.ts"]
    }
  }
});
