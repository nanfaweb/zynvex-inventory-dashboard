"use client";

import { useMemo } from "react";
import { formatCount, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

type Stat = { label: string; value: string; hint: string; tone?: "warn" };

export function StatsRow({ products }: { products: Product[] }) {
  const stats = useMemo<Stat[]>(() => {
    const units = products.reduce((sum, p) => sum + p.stock, 0);
    const valueCents = products.reduce((sum, p) => sum + p.salePrice.cents * p.stock, 0);
    const low = products.filter((p) => p.stockStatus !== "in-stock").length;
    const rated = products.filter((p) => p.rating > 0);
    const avg = rated.length ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length : 0;
    return [
      { label: "Products", value: formatCount(products.length), hint: `${formatCount(units)} units on hand` },
      { label: "Inventory value", value: formatMoney(valueCents / 100, { compact: true }), hint: "At current sale prices" },
      { label: "Needs restock", value: formatCount(low), hint: "Low or out of stock", tone: low > 0 ? "warn" : undefined },
      { label: "Avg. rating", value: avg ? avg.toFixed(2) : "—", hint: `Across ${formatCount(rated.length)} rated items` },
    ];
  }, [products]);

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <dt className="text-xs font-semibold text-muted">{stat.label}</dt>
          <dd className={`tabular mt-1.5 font-mono text-2xl font-bold tracking-tight ${stat.tone === "warn" ? "text-warn" : ""}`}>
            {stat.value}
          </dd>
          <dd className="mt-1 truncate text-xs text-muted">{stat.hint}</dd>
        </div>
      ))}
    </dl>
  );
}
