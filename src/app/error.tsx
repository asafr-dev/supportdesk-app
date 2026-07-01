"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl">
      <Card title="Something went wrong">
        <p className="text-sm text-zinc-700">An unexpected error occurred.</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Link className="no-underline" href="/">
            <Button variant="ghost">Go home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
