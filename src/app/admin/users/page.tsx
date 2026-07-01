import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, Button, Badge } from "@/components/ui";
import Link from "next/link";
import { setUserRoleAction } from "./actions";
import { isAdmin } from "@/lib/permissions";
import { ROLE_OPTIONS } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireUser();
  if (!isAdmin(me)) {
    return (
      <Card title="Forbidden">
        <p className="text-sm text-zinc-700">Admin access required.</p>
      </Card>
    );
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <Link href="/admin" className="no-underline">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>

      <Card title="Manage roles">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <span>{u.email}</span>
                      {u.id === me.id ? <Badge tone="green">me</Badge> : null}
                    </div>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-zinc-700">{u.role}</td>
                  <td className="py-2 pr-4 text-zinc-600">{u.createdAt.toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <form action={setUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="ghost">
                        Save
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Safety: you cannot demote yourself from ADMIN on this page.
        </p>
      </Card>
    </div>
  );
}
