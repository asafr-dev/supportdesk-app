"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { assignToMeAction } from "@/app/tickets/[id]/actions";

export function AssignToMeButton(props: { ticketId: number; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="ghost"
        disabled={props.disabled || pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await assignToMeAction(props.ticketId);
            if (!res.ok) setError(res.error);
          });
        }}
      >
        {pending ? "Assigning…" : "Assign to me"}
      </Button>
      {error ? (
        <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
