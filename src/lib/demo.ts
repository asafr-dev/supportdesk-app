/**
 * Demo constants for recruiter-facing deployments.
 *
 * Domain note:
 * - We use the RFC-reserved `.test` TLD
 */
export const DEMO_EMAIL_DOMAIN = "demo.test";

export const DEMO_ADMIN_EMAIL = `admin@${DEMO_EMAIL_DOMAIN}`;
export const DEMO_AGENT_EMAIL = `agent@${DEMO_EMAIL_DOMAIN}`;
export const DEMO_USER_EMAIL = `user@${DEMO_EMAIL_DOMAIN}`;

// Fail fast if the demo password is not configured.
export { requireDemoPassword } from "../../demoEnv.mjs";
