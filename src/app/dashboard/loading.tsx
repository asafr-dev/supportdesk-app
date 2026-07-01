import { Card } from "@/components/ui";

export default function Loading() {
  return (
    <div className="grid gap-4">
      <Card title="Loading dashboard…">
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
      </Card>
    </div>
  );
}
