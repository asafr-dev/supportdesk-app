import { Card, Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { countTicketsByStatus } from "@/lib/ticketService";
import { TICKET_STATUS_OPTIONS } from "@/lib/validators";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const res = await countTicketsByStatus({ user });
  if (!res.ok) {
    return (
      <Card title="Error">
        <p className="text-sm text-zinc-700">{res.error}</p>
      </Card>
    );
  }

  const { total, byStatus } = res.data;

  return (
    <div className="grid gap-4">
      <Card title="Overview">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge>{user.role}</Badge>
          <span className="text-zinc-600">{user.email}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total" value={total} />
          {TICKET_STATUS_OPTIONS.map((s) => (
            <Stat key={s.value} label={s.label} value={byStatus[s.value]} />
          ))}
        </div>

        <div className="mt-4 text-sm">
          <Link href="/tickets">Go to tickets →</Link>
        </div>
      </Card>
    </div>
  );
}

function Stat(props: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
      <div className="text-xs text-zinc-500">{props.label}</div>
      <div className="text-xl font-semibold">{props.value}</div>
    </div>
  );
}
