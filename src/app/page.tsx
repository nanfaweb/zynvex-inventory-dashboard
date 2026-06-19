"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorPanel } from "@/components/ui/error-panel";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useCatalogStore } from "@/store/catalog-store";

export default function Home() {
  const { catalog, localProducts, status, error, retryAttempt, loadCatalog } = useCatalogStore();

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const products = [...localProducts, ...catalog];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Stockroom</h1>
        <Link href="/products/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          Add product
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {status === "loading" && (retryAttempt > 0 ? `Connection is slow, retrying (attempt ${retryAttempt + 1} of 3)…` : "Loading catalog…")}
        {status === "ready" && `${products.length} products`}
      </p>

      <div className="mt-6">
        {status === "error" && (
          <ErrorPanel
            title="Couldn't load the catalog"
            message={error ?? "Unknown error"}
            onRetry={() => void loadCatalog({ force: true })}
          />
        )}
        {(status === "loading" || status === "idle") && <ProductGridSkeleton count={6} />}
        {status === "ready" && (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="font-mono text-xs text-muted">
                    {product.sku} · {product.stock} in stock · {formatMoney(product.salePrice)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
