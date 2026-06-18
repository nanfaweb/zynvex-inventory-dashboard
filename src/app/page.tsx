"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { useCatalogStore } from "@/store/catalog-store";

export default function Home() {
  const localProducts = useCatalogStore((state) => state.localProducts);
  const removeLocalProduct = useCatalogStore((state) => state.removeLocalProduct);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Stockroom</h1>
        <Link href="/products/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          Add product
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface">
        {localProducts.length === 0 && <li className="p-6 text-muted">No products yet.</li>}
        {localProducts.map((product) => (
          <li key={product.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{product.title}</p>
              <p className="font-mono text-xs text-muted">
                {product.sku} · {product.stock} in stock · {formatMoney(product.salePrice)}
              </p>
            </div>
            <button type="button" onClick={() => removeLocalProduct(product.id)} className="text-sm font-semibold text-danger">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
