import "./globals.css";
import Link from "next/link";
import { NavLink, Button } from "@/components/ui";
import { getSessionUser, clearSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export const metadata = {
  title: "SupportDesk App",
  description: "Demo helpdesk app"
};

async function LogoutButton() {
  async function logout() {
    "use server";
    await clearSession();
  }
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost">
        Sign out
      </Button>
    </form>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Link className="no-underline" href="/">
                <span className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
                  SupportDesk
                </span>
              </Link>
              <nav className="hidden items-center gap-1 md:flex">
                {user && (
                  <>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/tickets">Tickets</NavLink>
                    {isAdmin(user) ? <NavLink href="/admin">Admin</NavLink> : null}
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="hidden text-sm text-zinc-600 md:inline">
                    {user.email} • {user.role}
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <Link
                  className="rounded-xl px-3 py-2 text-sm no-underline hover:bg-zinc-100"
                  href="/login"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-xs text-zinc-500">
          Demo support desk app. Full-stack Next.js + Prisma.
        </footer>
      </body>
    </html>
  );
}
