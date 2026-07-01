"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { updateStatusAction } from "@/app/tickets/[id]/actions";
import { TICKET_STATUS_OPTIONS, type TicketStatusInput } from "@/lib/validators";

export function TicketStatusSelect(props: {
  ticketId: number;
  current: TicketStatusInput;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const res = await updateStatusAction(props.ticketId, formData);
            if (!res.ok) setError(res.error);
          });
        }}
        className="flex items-center gap-2"
      >
        <select
          name="status"
          defaultValue={props.current}
          disabled={!props.canEdit || pending}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
        >
          {TICKET_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="ghost" disabled={!props.canEdit || pending}>
          {pending ? "Saving…" : "Update"}
        </Button>
      </form>

      {error ? (
        <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
