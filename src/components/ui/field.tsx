import { useId, type ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
};

export function Field({ label, hint, error, optional, className = "", children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-semibold">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      <div className="mt-1.5">{children(id, message ? messageId : undefined)}</div>
      {message && (
        <p id={messageId} className={`mt-1.5 text-xs ${error ? "text-danger" : "text-muted"}`} role={error ? "alert" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

export function inputClass(error?: unknown) {
  return `w-full rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/25 ${
    error ? "border-danger" : "border-line"
  }`;
}
