import { LoginForm } from "./LoginForm";
import { DEMO_AGENT_EMAIL, requireDemoPassword } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;

  const nextPath = sp?.next && sp.next.startsWith("/") ? sp.next : "/dashboard";

  const demoPassword = requireDemoPassword();

  return (
    <div className="mx-auto max-w-md">
      <LoginForm
        nextPath={nextPath}
        prefillEmail={DEMO_AGENT_EMAIL}
        prefillPassword={demoPassword}
      />
    </div>
  );
}
