"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, Button, Input } from "@/components/ui";
import { loginAction } from "./actions";

const initialState = { error: null as string | null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm(props: {
  nextPath: string;
  prefillEmail: string;
  prefillPassword: string;
}) {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <Card title="Sign in">
      <form action={action} className="grid gap-3">
        <input type="hidden" name="next" value={props.nextPath} />
        <div>
          <label htmlFor="email" className="text-xs font-medium text-zinc-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={props.prefillEmail}
            placeholder="user@demo.test"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-medium text-zinc-700">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            defaultValue={props.prefillPassword}
            placeholder="Prefilled for the live demo (locally: set DEMO_PASSWORD or run db:reset)"
            required
          />
        </div>

        {state.error ? (
          <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {state.error}
          </div>
        ) : null}

        <SubmitButton />

        <p className="text-xs text-zinc-500">
          Use one of the seeded demo accounts (see home page).
        </p>
      </form>
    </Card>
  );
}
