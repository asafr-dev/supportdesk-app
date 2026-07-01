/**
 * Edge-safe runtime configuration.
 *
 * Keep env parsing in one place so middleware/auth/e2e stay aligned.
 */
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "sd_session";

export const SESSION_TTL_HOURS = (() => {
  const raw = process.env.SESSION_TTL_HOURS ?? "72";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 72;
})();

/**
 * Base URL used by tooling (e.g., Playwright). The app itself only needs relative URLs,
 * but keeping a single default avoids drift across configs.
 */
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
