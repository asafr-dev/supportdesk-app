import { requireUser } from "@/lib/auth";
import { TicketCreateForm } from "./TicketCreateForm";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <TicketCreateForm />
    </div>
  );
}
