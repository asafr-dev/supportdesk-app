import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// CI/build environments may not provide DATABASE_URL. Prisma doesn't connect until first query,
// but it *will* validate the URL shape, so provide a non-runnable placeholder.
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://db.invalid:5432/invalid?schema=public";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: { db: { url: databaseUrl } }
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
