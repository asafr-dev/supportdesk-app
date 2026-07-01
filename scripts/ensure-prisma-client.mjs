import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const generatedClient = path.join(root, "node_modules", ".prisma", "client", "default.js");

if (existsSync(generatedClient)) {
  process.exit(0);
}

const prismaBin =
  process.platform === "win32"
    ? path.join(root, "node_modules", ".bin", "prisma.cmd")
    : path.join(root, "node_modules", ".bin", "prisma");

const result = spawnSync(prismaBin, ["generate"], {
  cwd: root,
  stdio: "inherit",
  env: process.env
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
