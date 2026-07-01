import Link from "next/link";
import { TicketStatusBadge } from "@/components/TicketStatusBadge";
import type { TicketStatusInput } from "@/lib/validators";

export type TicketRow = {
  id: number;
  title: string;
  status: TicketStatusInput;
  updatedAt: string;
};

export function TicketTable({ rows }: { rows: TicketRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-xs text-zinc-500">
          <tr>
            <th className="py-2 pr-4">ID</th>
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t border-zinc-100">
              <td className="py-2 pr-4 font-mono text-xs text-zinc-600">{t.id}</td>
              <td className="py-2 pr-4">
                <Link href={`/tickets/${t.id}`} className="no-underline hover:underline">
                  {t.title}
                </Link>
              </td>
              <td className="py-2 pr-4">
                <TicketStatusBadge status={t.status} />
              </td>
              <td className="py-2 pr-4 text-zinc-600">{new Date(t.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-zinc-500">
                No tickets found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
