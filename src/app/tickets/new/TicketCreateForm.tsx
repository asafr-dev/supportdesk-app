"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTicketAction } from "@/app/tickets/actions";
import { Button, Input, TextArea, Card } from "@/components/ui";

const initialState = { error: null as string | null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create"}
    </Button>
  );
}

export function TicketCreateForm() {
  const [state, action] = useActionState(createTicketAction, initialState);

  return (
    <Card title="Create ticket">
      <form action={action} className="grid gap-3">
        <div>
          <label htmlFor="title" className="text-xs font-medium text-zinc-700">
            Title
          </label>
          <Input id="title" name="title" required placeholder="Short summary of the issue" />
        </div>
        <div>
          <label htmlFor="description" className="text-xs font-medium text-zinc-700">
            Description
          </label>
          <TextArea
            id="description"
            name="description"
            rows={6}
            placeholder="Steps to reproduce, expected vs actual, etc."
          />
        </div>

        {state.error ? (
          <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {state.error}
          </div>
        ) : null}

        <div className="flex gap-2">
          <SubmitButton />
          <Link
            className="rounded-xl px-3 py-2 text-sm no-underline hover:bg-zinc-100"
            href="/tickets"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
