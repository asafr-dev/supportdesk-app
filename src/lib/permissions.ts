import type { Prisma, Ticket, User } from "@prisma/client";
import { Role } from "@prisma/client";

export type UserLike = Pick<User, "id" | "role">;

export function isAdmin(user: UserLike): boolean {
  return user.role === Role.ADMIN;
}

export function isAgentOrAdmin(user: UserLike): boolean {
  return user.role === Role.AGENT || user.role === Role.ADMIN;
}

/**
 * Prisma where-clause for listing tickets visible to a user.
 */
export function ticketWhereForUser(user: UserLike): Prisma.TicketWhereInput {
  if (user.role === Role.USER) return { requesterId: user.id };
  return {};
}

export function canViewTicket(user: UserLike, ticket: Pick<Ticket, "requesterId">): boolean {
  return isAgentOrAdmin(user) || ticket.requesterId === user.id;
}

export function canEditTicketStatus(user: UserLike): boolean {
  return isAgentOrAdmin(user);
}

export function canCommentOnTicket(user: UserLike, ticket: Pick<Ticket, "requesterId">): boolean {
  return isAgentOrAdmin(user) || ticket.requesterId === user.id;
}

export function canAssignTicket(user: UserLike): boolean {
  return isAgentOrAdmin(user);
}
