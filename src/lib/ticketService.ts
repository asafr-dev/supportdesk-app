import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/auditActions";
import {
  auditMetaCommentCreated,
  auditMetaTicketAssigned,
  auditMetaTicketCreated,
  auditMetaTicketStatusChanged
} from "@/lib/auditMeta";
import { TICKET_STATUS_VALUES, type TicketStatusInput } from "@/lib/validators";
import { fromPrismaTicketStatus, toPrismaTicketStatus } from "@/lib/ticketStatusPrisma";
import { clampPagination } from "@/lib/pagination";
import type { UserLike } from "@/lib/permissions";
import {
  canAssignTicket,
  canCommentOnTicket,
  canEditTicketStatus,
  canViewTicket,
  ticketWhereForUser
} from "@/lib/permissions";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: 400 | 401 | 403 | 404 | 500 };

function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

function err(status: 400 | 401 | 403 | 404 | 500, error: string): ServiceResult<never> {
  return { ok: false, status, error };
}

export async function listTickets(args: {
  user: UserLike;
  status?: TicketStatusInput;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const { limit, offset } = clampPagination({ limit: args.limit, offset: args.offset });
  const where: Prisma.TicketWhereInput = {
    ...ticketWhereForUser(args.user)
  };

  if (args.status) where.status = toPrismaTicketStatus(args.status);
  if (args.q) where.title = { contains: args.q, mode: "insensitive" };

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      requesterId: true
    }
  });
  return ok(tickets);
}

export async function getTicketById(args: { user: UserLike; id: number }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: args.id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      requesterId: true
    }
  });

  if (!ticket) return err(404, "Not found");
  if (!canViewTicket(args.user, ticket)) return err(403, "Forbidden");
  return ok(ticket);
}

export async function getTicketDetail(args: { user: UserLike; id: number }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: args.id },
    include: {
      requester: true,
      assignee: true,
      comments: {
        include: { author: true },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }]
      },
      auditLogs: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 10,
        include: { actor: true }
      }
    }
  });

  if (!ticket) return err(404, "Ticket not found");
  if (!canViewTicket(args.user, ticket)) return err(403, "Forbidden");
  return ok(ticket);
}

export async function countTicketsByStatus(args: { user: UserLike }) {
  const baseWhere: Prisma.TicketWhereInput = {
    ...ticketWhereForUser(args.user)
  };

  const total = await prisma.ticket.count({ where: baseWhere });

  const entries = await Promise.all(
    TICKET_STATUS_VALUES.map(async (status) => {
      const count = await prisma.ticket.count({
        where: { ...baseWhere, status: toPrismaTicketStatus(status) }
      });
      return [status, count] as const;
    })
  );

  const byStatus = Object.fromEntries(entries) as Record<TicketStatusInput, number>;
  return ok({ total, byStatus });
}

export async function createTicket(args: {
  user: UserLike;
  title: string;
  description?: string;
  via: "ui";
}) {
  const ticket = await prisma.ticket.create({
    data: {
      title: args.title,
      description: args.description ?? "",
      requesterId: args.user.id,
      assigneeId: null
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      requesterId: true
    }
  });

  await audit(
    ticket.id,
    args.user.id,
    AUDIT_ACTIONS.TICKET_CREATED,
    auditMetaTicketCreated({ via: args.via, status: fromPrismaTicketStatus(ticket.status) })
  );
  return ok(ticket);
}

export async function addComment(args: {
  user: UserLike;
  ticketId: number;
  body: string;
  via: "ui";
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: args.ticketId },
    select: { requesterId: true }
  });
  if (!ticket) return err(404, "Ticket not found");
  if (!canCommentOnTicket(args.user, ticket)) return err(403, "Forbidden");

  const comment = await prisma.comment.create({
    data: { ticketId: args.ticketId, authorId: args.user.id, body: args.body },
    select: { id: true, body: true, createdAt: true }
  });

  await audit(
    args.ticketId,
    args.user.id,
    AUDIT_ACTIONS.COMMENT_CREATED,
    auditMetaCommentCreated({ via: args.via, commentId: comment.id })
  );
  return ok(comment);
}

export async function updateStatus(args: {
  user: UserLike;
  ticketId: number;
  status: TicketStatusInput;
  via: "ui";
}) {
  if (!canEditTicketStatus(args.user)) return err(403, "Forbidden");

  const existing = await prisma.ticket.findUnique({
    where: { id: args.ticketId },
    select: { status: true }
  });
  if (!existing) return err(404, "Ticket not found");

  const updated = await prisma.ticket.update({
    where: { id: args.ticketId },
    data: { status: toPrismaTicketStatus(args.status) },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      requesterId: true
    }
  });

  await audit(
    args.ticketId,
    args.user.id,
    AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
    auditMetaTicketStatusChanged({
      via: args.via,
      from: fromPrismaTicketStatus(existing.status),
      to: fromPrismaTicketStatus(updated.status)
    })
  );
  return ok(updated);
}

export async function assignToMe(args: { user: UserLike; ticketId: number; via: "ui" }) {
  if (!canAssignTicket(args.user)) return err(403, "Forbidden");

  const ticket = await prisma.ticket.findUnique({
    where: { id: args.ticketId },
    select: { assigneeId: true }
  });
  if (!ticket) return err(404, "Ticket not found");

  await prisma.ticket.update({
    where: { id: args.ticketId },
    data: { assigneeId: args.user.id }
  });

  await audit(
    args.ticketId,
    args.user.id,
    AUDIT_ACTIONS.TICKET_ASSIGNED,
    auditMetaTicketAssigned({ via: args.via, assigneeId: args.user.id })
  );
  return ok({});
}
