import fs from "node:fs";
import path from "node:path";

import * as dotenv from "dotenv";

import net from "node:net";

// Be explicit: load .env from the current working directory if present.
// This avoids CI/local surprises when the parent process doesn't preload dotenv.
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseDatabaseUrl(url: string) {
  const u = new URL(url);
  const host = u.hostname || "localhost";
  const port = u.port ? Number(u.port) : 5432;
  return { host, port };
}

async function waitForPort(host: string, port: number, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.once("error", () => resolve(false));
      socket.once("timeout", () => resolve(false));
      socket.connect(port, host, () => {
        socket.end();
        resolve(true);
      });
    });

    if (ok) return;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for DB TCP port ${host}:${port}`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const { host, port } = parseDatabaseUrl(url);
  const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS ?? 30_000);

  process.stdout.write(`Waiting for database on ${host}:${port} ... `);
  await waitForPort(host, port, timeoutMs);
  process.stdout.write("ready\n");
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
