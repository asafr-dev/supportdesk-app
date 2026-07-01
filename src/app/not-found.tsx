import Link from "next/link";
import { Card, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Card title="Not found">
        <p className="text-sm text-zinc-700">That page doesn&apos;t exist.</p>
        <div className="mt-4">
          <Link className="no-underline" href="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
