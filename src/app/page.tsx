import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Card, Button } from "@/components/ui";
import { DEMO_ADMIN_EMAIL, DEMO_AGENT_EMAIL, DEMO_USER_EMAIL } from "@/lib/demo";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card title="SupportDesk App">
        <p className="text-sm text-zinc-700">
          A small helpdesk app to demonstrate fullstack patterns: auth, RBAC, CRUD, validation,
          server actions, API routes, Prisma/Postgres, and CI.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user && (
            <>
              <Link href="/dashboard" className="no-underline">
                <Button>Go to dashboard</Button>
              </Link>
              <Link href="/tickets" className="no-underline">
                <Button variant="ghost">View tickets</Button>
              </Link>
            </>
          )}
        </div>
      </Card>

      <Card title="Demo accounts">
        <ul className="list-disc pl-5 text-sm text-zinc-700">
          <li>
            <code>{DEMO_ADMIN_EMAIL}</code>
          </li>
          <li>
            <code>{DEMO_AGENT_EMAIL}</code>
          </li>
          <li>
            <code>{DEMO_USER_EMAIL}</code>
          </li>
        </ul>

        <p className="mt-2 text-sm text-zinc-700">
          Live demo: the login form is prefilled (email + demo password). Just click <b>Sign in</b>.
        </p>
      </Card>
    </div>
  );
}
