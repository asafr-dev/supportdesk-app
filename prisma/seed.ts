import { PrismaClient, Role, TicketStatus, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AUDIT_ACTIONS } from "../src/lib/auditActions";
import {
  auditMetaCommentCreated,
  auditMetaTicketAssigned,
  auditMetaTicketCreated,
  auditMetaTicketStatusChanged
} from "../src/lib/auditMeta";
import { fromPrismaTicketStatus } from "../src/lib/ticketStatusPrisma";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_AGENT_EMAIL,
  DEMO_EMAIL_DOMAIN,
  DEMO_USER_EMAIL,
  requireDemoPassword
} from "../src/lib/demo";

const prisma = new PrismaClient();

/**
 * Demo seed data:
 * - 3 demo users (admin/agent/user)
 * - 15 tickets across statuses (open/in_progress/resolved)
 * - 1-3 comments per ticket
 * - audit log entries for creation + status transitions + selected comments
 */
async function main() {
  const demoPassword = requireDemoPassword();
  const pw = await bcrypt.hash(demoPassword, 10);

  // Clean (ok for dev)
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: { email: DEMO_ADMIN_EMAIL, name: "Admin", role: Role.ADMIN, passwordHash: pw }
  });

  const agent = await prisma.user.create({
    data: { email: DEMO_AGENT_EMAIL, name: "Agent", role: Role.AGENT, passwordHash: pw }
  });

  const user = await prisma.user.create({
    data: { email: DEMO_USER_EMAIL, name: "User", role: Role.USER, passwordHash: pw }
  });

  // Extra requester users (no password) so tickets look like a real queue.
  const customers = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `customer${i + 1}@${DEMO_EMAIL_DOMAIN}`,
          name: `Customer ${i + 1}`,
          role: Role.USER,
          passwordHash: null
        }
      })
    )
  );

  // Curated (first 15 are used). Avoid copy that undermines the demo.
  const ticketTemplates: Array<{ title: string; description: string }> = [
    {
      title: "Cannot reset password",
      description: "Reset link shows expired immediately on first click."
    },
    {
      title: "Billing page 500 error",
      description: "Visiting /billing intermittently returns 500 in production."
    },
    {
      title: "Feature request: export tickets",
      description: "Would love CSV export from the ticket dashboard."
    },
    {
      title: "Login redirect loop",
      description: "After login I get redirected back to /login repeatedly."
    },
    { title: "Emails not delivered", description: "Password reset emails sometimes never arrive." },
    {
      title: "Slow search results",
      description: "Searching tickets is noticeably slow with larger data sets."
    },
    { title: "Mobile layout issue", description: "Ticket table overflows on small screens." },
    {
      title: "Webhook retries",
      description: "We need retry handling for failed webhook deliveries."
    },
    { title: "SLA labels", description: "Add labels for SLA and priority visibility." },
    { title: "Attachments support", description: "Allow attaching screenshots/logs to tickets." },
    {
      title: "Agent assignment clarity",
      description: "Show ownership clearly when multiple agents collaborate."
    },
    {
      title: "Timezone mismatch",
      description: "Timestamps appear in a different timezone than expected."
    },
    {
      title: "Dark mode polish",
      description: "Buttons and inputs need better contrast in dark mode."
    },
    {
      title: "Pagination edge case",
      description: "Ticket list shows duplicate rows when paginating quickly."
    },
    {
      title: "Notification preferences",
      description: "Users want per-ticket notification preferences."
    }
  ];

  // Create 15 tickets with realistic distribution + some unassigned
  const finalStatuses: TicketStatus[] = [
    TicketStatus.OPEN,
    TicketStatus.OPEN,
    TicketStatus.OPEN,
    TicketStatus.OPEN,
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.IN_PROGRESS,
    TicketStatus.IN_PROGRESS,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.RESOLVED,
    TicketStatus.RESOLVED,
    TicketStatus.RESOLVED,
    TicketStatus.RESOLVED,
    TicketStatus.RESOLVED
  ];

  // Time cursor so createdAt values are stable, spaced, and read naturally in the UI.
  let cursor = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7); // ~1 week ago
  const bumpMinutes = (m: number) => {
    cursor = new Date(cursor.getTime() + m * 60 * 1000);
    return cursor;
  };
  const bumpSeconds = (s: number) => {
    cursor = new Date(cursor.getTime() + s * 1000);
    return cursor;
  };

  const requesters = [user, ...customers, admin];

  const userCommentBodies = [
    "I can reproduce this consistently.",
    "This blocks my workflow — any workaround?",
    "Happening since the latest deploy.",
    "I tried multiple browsers; same issue.",
    "Here are more details: it happens after a page refresh."
  ];
  const agentCommentBodies = [
    "Thanks — investigating logs and recent changes.",
    "Acknowledged. I can reproduce; working on a fix.",
    "Adding better error handling + retry; will update shortly.",
    "Can you confirm exact steps and expected behavior?",
    "Fix is ready for review; will deploy after CI passes."
  ];
  const createAudit = async (args: {
    ticketId: number;
    actorId: string;
    action: string;
    createdAt: Date;
    meta?: Prisma.InputJsonValue;
  }) => {
    await prisma.auditLog.create({
      data: {
        ticketId: args.ticketId,
        actorId: args.actorId,
        action: args.action,
        createdAt: args.createdAt,
        ...(args.meta === undefined ? {} : { meta: args.meta })
      }
    });
  };

  // Per-ticket lifecycle: create -> (assign) -> comments -> status transitions.
  for (let i = 0; i < finalStatuses.length; i++) {
    const t = ticketTemplates[i] ?? { title: `Issue #${i + 1}`, description: "Details pending." };
    const finalStatus = finalStatuses[i] ?? TicketStatus.OPEN;

    // Mirror your screenshot: ensure at least one ticket shows the full lifecycle
    // (created/assigned/comments/status changes) with the AGENT as the actor.
    const requester = i === finalStatuses.length - 1 ? agent : requesters[i % requesters.length]!;

    // Create unassigned, then assign (so ticket.assigned exists in history).
    const createdAt = bumpMinutes(45);
    const ticket = await prisma.ticket.create({
      data: {
        title: t.title,
        description: t.description,
        status: TicketStatus.OPEN,
        requesterId: requester.id,
        assigneeId: null,
        createdAt,
        updatedAt: createdAt
      }
    });

    await createAudit({
      ticketId: ticket.id,
      actorId: requester.id,
      action: AUDIT_ACTIONS.TICKET_CREATED,
      meta: auditMetaTicketCreated({
        via: "seed",
        status: fromPrismaTicketStatus(TicketStatus.OPEN)
      }),
      createdAt: bumpSeconds(15)
    });

    const shouldAssign = finalStatus !== TicketStatus.OPEN || i % 3 !== 0;
    if (shouldAssign) {
      const assignAt = bumpMinutes(5);
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { assigneeId: agent.id, updatedAt: assignAt }
      });
      await createAudit({
        ticketId: ticket.id,
        actorId: agent.id,
        action: AUDIT_ACTIONS.TICKET_ASSIGNED,
        meta: auditMetaTicketAssigned({ via: "seed", assigneeId: agent.id }),
        createdAt: bumpSeconds(10)
      });
    }

    // Comments (seed sequentially so timestamps are unique and UI ordering is stable)
    const requesterCommentAt = bumpMinutes(3);
    const requesterComment = await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        authorId: requester.id,
        body: userCommentBodies[i % userCommentBodies.length]!,
        createdAt: requesterCommentAt
      }
    });
    await createAudit({
      ticketId: ticket.id,
      actorId: requester.id,
      action: AUDIT_ACTIONS.COMMENT_CREATED,
      meta: auditMetaCommentCreated({ via: "seed", commentId: requesterComment.id }),
      createdAt: bumpSeconds(10)
    });

    const agentReplyAt = bumpMinutes(8);
    const agentReply = await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        authorId: agent.id,
        body: agentCommentBodies[i % agentCommentBodies.length]!,
        createdAt: agentReplyAt
      }
    });
    await createAudit({
      ticketId: ticket.id,
      actorId: agent.id,
      action: AUDIT_ACTIONS.COMMENT_CREATED,
      meta: auditMetaCommentCreated({ via: "seed", commentId: agentReply.id }),
      createdAt: bumpSeconds(10)
    });

    if (i % 4 === 0) {
      const followupAt = bumpMinutes(6);
      const followup = await prisma.comment.create({
        data: {
          ticketId: ticket.id,
          authorId: requester.id,
          body: userCommentBodies[(i + 2) % userCommentBodies.length]!,
          createdAt: followupAt
        }
      });
      await createAudit({
        ticketId: ticket.id,
        actorId: requester.id,
        action: AUDIT_ACTIONS.COMMENT_CREATED,
        meta: auditMetaCommentCreated({ via: "seed", commentId: followup.id }),
        createdAt: bumpSeconds(10)
      });
    }

    // Status transitions (meta uses canonical UI/API statuses)
    let lastEventAt = cursor;

    if (finalStatus === TicketStatus.IN_PROGRESS || finalStatus === TicketStatus.RESOLVED) {
      const toInProgressAt = bumpMinutes(12);
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.IN_PROGRESS, updatedAt: toInProgressAt }
      });

      await createAudit({
        ticketId: ticket.id,
        actorId: agent.id,
        action: AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
        meta: auditMetaTicketStatusChanged({
          via: "seed",
          from: fromPrismaTicketStatus(TicketStatus.OPEN),
          to: fromPrismaTicketStatus(TicketStatus.IN_PROGRESS)
        }),
        createdAt: bumpSeconds(10)
      });

      lastEventAt = cursor;
    }

    if (finalStatus === TicketStatus.RESOLVED) {
      const toResolvedAt = bumpMinutes(15);
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.RESOLVED, updatedAt: toResolvedAt }
      });

      await createAudit({
        ticketId: ticket.id,
        actorId: agent.id,
        action: AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
        meta: auditMetaTicketStatusChanged({
          via: "seed",
          from: fromPrismaTicketStatus(TicketStatus.IN_PROGRESS),
          to: fromPrismaTicketStatus(TicketStatus.RESOLVED)
        }),
        createdAt: bumpSeconds(10)
      });

      lastEventAt = cursor;

      // 1 ticket gets a reopen cycle for realism.
      if (i === 10) {
        const reopenToOpenAt = bumpMinutes(30);
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.OPEN, updatedAt: reopenToOpenAt }
        });

        await createAudit({
          ticketId: ticket.id,
          actorId: agent.id,
          action: AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
          meta: auditMetaTicketStatusChanged({
            via: "seed",
            from: fromPrismaTicketStatus(TicketStatus.RESOLVED),
            to: fromPrismaTicketStatus(TicketStatus.OPEN)
          }),
          createdAt: bumpSeconds(10)
        });

        const reopenToInProgressAt = bumpMinutes(8);
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.IN_PROGRESS, updatedAt: reopenToInProgressAt }
        });

        await createAudit({
          ticketId: ticket.id,
          actorId: agent.id,
          action: AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
          meta: auditMetaTicketStatusChanged({
            via: "seed",
            from: fromPrismaTicketStatus(TicketStatus.OPEN),
            to: fromPrismaTicketStatus(TicketStatus.IN_PROGRESS)
          }),
          createdAt: bumpSeconds(10)
        });

        const reopenToResolvedAt = bumpMinutes(12);
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.RESOLVED, updatedAt: reopenToResolvedAt }
        });

        await createAudit({
          ticketId: ticket.id,
          actorId: agent.id,
          action: AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
          meta: auditMetaTicketStatusChanged({
            via: "seed",
            from: fromPrismaTicketStatus(TicketStatus.IN_PROGRESS),
            to: fromPrismaTicketStatus(TicketStatus.RESOLVED)
          }),
          createdAt: bumpSeconds(10)
        });

        lastEventAt = cursor;
      }
    }

    // Ensure /tickets ordering (updatedAt desc) reflects last activity in the lifecycle.
    await prisma.$executeRaw`
      UPDATE "Ticket" SET "updatedAt" = ${lastEventAt} WHERE "id" = ${ticket.id}
    `;
  }

  console.log("Seed complete. Demo users:");
  console.log(DEMO_ADMIN_EMAIL);
  console.log(DEMO_AGENT_EMAIL);
  console.log(DEMO_USER_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
