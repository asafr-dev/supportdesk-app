"use client";

import { useRef, useState, useTransition } from "react";
import { Button, TextArea } from "@/components/ui";
import { addCommentAction } from "@/app/tickets/[id]/actions";

export function TicketComments(props: { ticketId: number; canComment: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const res = await addCommentAction(props.ticketId, formData);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          if (ref.current) ref.current.value = "";
        });
      }}
      className="grid gap-2"
    >
      <TextArea
        ref={ref}
        name="body"
        rows={3}
        placeholder="Add a comment…"
        disabled={!props.canComment || pending}
      />

      {error ? (
        <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={!props.canComment || pending}>
          {pending ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
