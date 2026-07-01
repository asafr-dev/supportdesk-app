import { requireDemoPassword } from "./demoEnv.mjs";

const PHASE_DEVELOPMENT_SERVER = "phase-development-server";
const PHASE_PRODUCTION_SERVER = "phase-production-server";

/**
 * @type {(phase: string, ctx: { defaultConfig: import('next').NextConfig }) => import('next').NextConfig}
 */
export default function nextConfig(phase) {
  // Fail fast on server start (dev + next start), but do NOT break builds.
  // This repo is demo/reviewer-facing; we intentionally require DEMO_PASSWORD.
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER) {
    requireDemoPassword();
  }

  return {
    experimental: {
      serverActions: {
        allowedOrigins: ["localhost:3000"]
      }
    }
  };
}
