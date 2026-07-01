import { Card, Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { assertIntId } from "@/lib/ids";
import { fromPrismaTicketStatus } from "@/lib/ticketStatusPrisma";
import { TicketStatusBadge } from "@/components/TicketStatusBadge";
import { TicketStatusSelect } from "@/components/TicketStatusSelect";
import { TicketComments } from "@/components/TicketComments";
import { AssignToMeButton } from "@/components/AssignToMeButton";
import { getTicketDetail } from "@/lib/ticketService";
import { canCommentOnTicket, canEditTicketStatus } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const p = await params;
  const id = assertIntId(p.id);

  const res = await getTicketDetail({ user, id });

  if (!res.ok) {
    if (res.status === 404) {
      return (
        <Card title="Not found">
          <p className="text-sm text-zinc-700">Ticket not found.</p>
        </Card>
      );
    }

    if (res.status === 403) {
      return (
        <Card title="Forbidden">
          <p className="text-sm text-zinc-700">You do not have access to this ticket.</p>
        </Card>
      );
    }

    return (
      <Card title="Error">
        <p className="text-sm text-zinc-700">{res.error}</p>
      </Card>
    );
  }

  const ticket = res.data;

  const status = fromPrismaTicketStatus(ticket.status);
  const canEditStatus = canEditTicketStatus(user);
  const canComment = canCommentOnTicket(user, ticket);

  const assigneeLabel = ticket.assignee ? ticket.assignee.email : "Unassigned";
  const isAssignedToMe = ticket.assigneeId === user.id;

  return (
    <div className="grid gap-4">
      <Card title={`Ticket #${ticket.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[240px]">
            <div className="text-lg font-semibold">{ticket.title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
              <TicketStatusBadge status={status} />
              <span>Requester: {ticket.requester.email}</span>
              <span>•</span>
              <span>Assignee: {assigneeLabel}</span>
              {isAssignedToMe ? <Badge tone="green">me</Badge> : null}
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              Updated: {ticket.updatedAt.toLocaleString()}
            </div>
          </div>

          <div className="grid gap-3">
            <TicketStatusSelect ticketId={ticket.id} current={status} canEdit={canEditStatus} />
            {canEditStatus && !isAssignedToMe ? <AssignToMeButton ticketId={ticket.id} /> : null}
          </div>
        </div>

        <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-800 ring-1 ring-zinc-200">
          {ticket.description || <span className="text-zinc-500">No description.</span>}
        </div>
      </Card>

      <Card title="Comments">
        <div className="grid gap-3">
          {ticket.comments.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-3 ring-1 ring-zinc-200">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{c.author.email}</span>
                <span>{c.createdAt.toLocaleString()}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm">{c.body}</div>
            </div>
          ))}
          {ticket.comments.length === 0 ? (
            <p className="text-sm text-zinc-500">No comments yet.</p>
          ) : null}

          <div className="pt-2">
            <TicketComments ticketId={ticket.id} canComment={canComment} />
          </div>
        </div>
      </Card>

      <Card title="Recent audit log">
        <ul className="grid gap-2 text-sm">
          {ticket.auditLogs.map((a) => (
            <li key={a.id} className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{a.actor.email}</span>
                <span>{a.createdAt.toLocaleString()}</span>
              </div>
              <div className="mt-1">
                <span className="font-medium">{a.action}</span>
                {a.meta ? (
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-white p-2 text-xs ring-1 ring-zinc-200">
                    {JSON.stringify(a.meta, null, 2)}
                  </pre>
                ) : null}
              </div>
            </li>
          ))}
          {ticket.auditLogs.length === 0 ? (
            <li className="text-zinc-500">No audit entries.</li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
