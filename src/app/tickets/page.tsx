import { Card, Button, Input } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { ticketStatusInput, TICKET_STATUS_OPTIONS } from "@/lib/validators";
import { fromPrismaTicketStatus } from "@/lib/ticketStatusPrisma";
import Link from "next/link";
import { TicketTable } from "@/components/TicketTable";
import { listTickets } from "@/lib/ticketService";
import { MAX_PAGE_LIMIT } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function TicketsPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const statusRaw = sp?.status;
  const q = (sp?.q ?? "").trim();

  const statusParsed = statusRaw ? ticketStatusInput.safeParse(statusRaw) : null;

  const res = await listTickets({
    user,
    status: statusParsed?.success ? statusParsed.data : undefined,
    q,
    limit: MAX_PAGE_LIMIT,
    offset: 0
  });

  if (!res.ok) {
    return (
      <Card title="Tickets">
        <p className="text-sm text-zinc-700">Failed to load tickets: {res.error}</p>
      </Card>
    );
  }

  const tickets = res.data;

  const rows = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    status: fromPrismaTicketStatus(t.status),
    updatedAt: t.updatedAt.toISOString()
  }));

  return (
    <div className="grid gap-4">
      <Card title="Tickets">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <form className="flex flex-wrap items-center gap-2" action="/tickets" method="get">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search title..."
              className="w-56"
              autoComplete="off"
            />
            <select
              name="status"
              defaultValue={statusParsed?.success ? statusParsed.data : ""}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
            >
              <option value="">Any status</option>
              {TICKET_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="ghost">
              Filter
            </Button>
          </form>

          <Link href="/tickets/new" className="no-underline">
            <Button>Create ticket</Button>
          </Link>
        </div>

        <div className="mt-4">
          <TicketTable rows={rows} />
        </div>
      </Card>
    </div>
  );
}
