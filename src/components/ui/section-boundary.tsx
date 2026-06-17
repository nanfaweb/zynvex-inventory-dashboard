"use client";

import { catchError, type ErrorInfo } from "next/error";
import { ErrorPanel } from "@/components/ui/error-panel";

/**
 * Wraps one dashboard widget in its own error boundary so a crash in, say,
 * the stats row doesn't take the product grid down with it.
 */
function SectionFallback(props: { name: string }, { error, reset }: ErrorInfo) {
  return (
    <ErrorPanel
      compact
      title={`${props.name} failed to render`}
      message="The rest of the dashboard still works. You can retry this section."
      detail={error instanceof Error ? error.message : String(error)}
      onRetry={reset}
    />
  );
}

export const SectionBoundary = catchError(SectionFallback);
