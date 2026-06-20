"use client";

import Image from "next/image";
import { StockBadge } from "@/components/ui/stock-badge";
import { formatMoney } from "@/lib/format";
import { slugToLabel } from "@/lib/parse";
import type { Product } from "@/lib/types";

export function ProductThumb({ product, sizes, className = "" }: { product: Product; sizes: string; className?: string }) {
  if (!product.thumbnail) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-accent-soft to-surface-2 ${className}`}>
        <span className="text-3xl font-extrabold text-accent/60">{product.title.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <div className={`relative bg-surface-2 ${className}`}>
      <Image
        src={product.thumbnail}
        alt=""
        fill
        sizes={sizes}
        // User-entered URLs can point anywhere, so skip the optimizer for them.
        unoptimized={product.source === "local"}
        className="object-contain p-3 mix-blend-multiply dark:mix-blend-normal"
      />
    </div>
  );
}

export function ProductCard({ product, onSelect }: { product: Product; onSelect: (id: string) => void }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-black/5">
      <ProductThumb product={product} sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 640px) 45vw, 90vw" className="aspect-[4/3]" />
      {product.source === "local" && (
        <span className="absolute left-3 top-3 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-canvas">
          Yours
        </span>
      )}
      {product.discountPercent >= 1 && (
        <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-2 py-0.5 font-mono text-[11px] font-bold text-accent ring-1 ring-line backdrop-blur">
          −{Math.round(product.discountPercent)}%
        </span>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          {slugToLabel(product.category)} · {product.brand}
        </p>
        <h3 className="line-clamp-2 font-bold leading-snug">
          <button type="button" onClick={() => onSelect(product.id)} className="text-left after:absolute after:inset-0">
            {product.title}
          </button>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="tabular font-mono text-lg font-bold">{formatMoney(product.salePrice)}</p>
            {product.discountPercent >= 1 && (
              <p className="tabular font-mono text-xs text-muted line-through">{formatMoney(product.price)}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <StockBadge status={product.stockStatus} stock={product.stock} />
            {product.rating > 0 && (
              <span className="tabular font-mono text-xs text-muted" aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}>
                ★ {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
