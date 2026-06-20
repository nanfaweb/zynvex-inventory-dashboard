"use client";

import { ProductThumb } from "@/components/dashboard/product-card";
import { StockBadge } from "@/components/ui/stock-badge";
import { formatMoney } from "@/lib/format";
import { slugToLabel } from "@/lib/parse";
import type { Product } from "@/lib/types";

export function ProductTable({ products, onSelect }: { products: Product[]; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line bg-surface-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
          <tr>
            <th scope="col" className="px-4 py-3">Product</th>
            <th scope="col" className="px-4 py-3">SKU</th>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3 text-right">Price</th>
            <th scope="col" className="px-4 py-3 text-right">Rating</th>
            <th scope="col" className="px-4 py-3">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product) => (
            <tr key={product.id} className="group cursor-pointer hover:bg-surface-2" onClick={() => onSelect(product.id)}>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <ProductThumb product={product} sizes="40px" className="size-10 shrink-0 overflow-hidden rounded-lg [&_img]:p-1" />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(product.id);
                      }}
                      className="max-w-[18rem] truncate text-left font-bold group-hover:text-accent"
                    >
                      {product.title}
                    </button>
                    <p className="text-xs text-muted">{product.brand}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted">{product.sku}</td>
              <td className="px-4 py-2.5 text-ink-soft">{slugToLabel(product.category)}</td>
              <td className="tabular px-4 py-2.5 text-right font-mono font-bold">{formatMoney(product.salePrice)}</td>
              <td className="tabular px-4 py-2.5 text-right font-mono text-muted">{product.rating > 0 ? product.rating.toFixed(1) : "—"}</td>
              <td className="px-4 py-2.5">
                <StockBadge status={product.stockStatus} stock={product.stock} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
