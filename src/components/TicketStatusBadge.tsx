import { Badge } from "@/components/ui";
import { ticketStatusLabel, ticketStatusTone, type TicketStatusInput } from "@/lib/validators";

export function TicketStatusBadge({ status }: { status: TicketStatusInput }) {
  return <Badge tone={ticketStatusTone(status)}>{ticketStatusLabel(status)}</Badge>;
}
