import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { AuditAction } from "@/lib/auditActions";

export async function audit(
  ticketId: number,
  actorId: string,
  action: AuditAction,
  meta?: Prisma.InputJsonValue
) {
  await prisma.auditLog.create({
    data: {
      ticketId,
      actorId,
      action,
      meta: meta ?? undefined
    }
  });
}
