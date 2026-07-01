import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser();
  if (!isAdmin(user)) {
    return (
      <Card title="Forbidden">
        <p className="text-sm text-zinc-700">Admin access required.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card title="Admin">
        <p className="text-sm text-zinc-700">Small admin tools for this demo.</p>
        <div className="mt-4">
          <Link href="/admin/users" className="no-underline">
            <Button>Manage users</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
