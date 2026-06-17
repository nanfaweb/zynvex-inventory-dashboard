type ErrorPanelProps = {
  title: string;
  message: string;
  detail?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorPanel({ title, message, detail, onRetry, compact = false }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-danger/30 bg-danger-soft text-ink ${compact ? "p-4" : "p-6 sm:p-8"}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-danger text-sm font-bold text-white">
          !
        </span>
        <div className="min-w-0">
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm text-ink-soft">{message}</p>
          {detail && <p className="mt-2 break-all font-mono text-xs text-muted">{detail}</p>}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
