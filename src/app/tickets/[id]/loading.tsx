import { Card } from "@/components/ui";

export default function Loading() {
  return (
    <div className="grid gap-4">
      <Card title="Loading ticket…">
        <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
      </Card>
      <Card title="Loading comments…">
        <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
      </Card>
    </div>
  );
}
