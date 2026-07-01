import { Card } from "@/components/ui";

export default function Loading() {
  return (
    <Card title="Loading tickets…">
      <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
    </Card>
  );
}
