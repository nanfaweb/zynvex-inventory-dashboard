import type { StockStatus } from "@/lib/types";

const styles: Record<StockStatus, { label: string; className: string }> = {
  "in-stock": { label: "In stock", className: "bg-accent-soft text-accent" },
  "low-stock": { label: "Low stock", className: "bg-warn-soft text-warn" },
  "out-of-stock": { label: "Out of stock", className: "bg-danger-soft text-danger" },
};

export function StockBadge({ status, stock }: { status: StockStatus; stock?: number }) {
  const style = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${style.className}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {stock !== undefined && status !== "out-of-stock" ? `${stock} · ${style.label}` : style.label}
    </span>
  );
}

export const stockLabels: Record<StockStatus | "all", string> = {
  all: "All stock",
  "in-stock": styles["in-stock"].label,
  "low-stock": styles["low-stock"].label,
  "out-of-stock": styles["out-of-stock"].label,
};
