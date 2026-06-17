"use client";

import { ErrorPanel } from "@/components/ui/error-panel";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <ErrorPanel
        title="This page hit an unexpected error"
        message="Your saved products are safe in this browser. Try again, and if it keeps happening, reload the page."
        detail={digest ? `Reference: ${digest}` : undefined}
        onRetry={retry}
      />
    </main>
  );
}
