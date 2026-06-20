"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo, Sidebar } from "@/components/dashboard/sidebar";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ProductCard } from "@/components/dashboard/product-card";
import { ProductTable } from "@/components/dashboard/product-table";
import { SearchBar } from "@/components/dashboard/search-bar";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ErrorPanel } from "@/components/ui/error-panel";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { ProductGridSkeleton, StatsSkeleton } from "@/components/ui/skeleton";
import { useAllProducts, useVisibleProducts } from "@/hooks/use-catalog";
import { slugToLabel } from "@/lib/parse";
import { useCatalogStore } from "@/store/catalog-store";

export function Dashboard() {
  const status = useCatalogStore((state) => state.status);
  const error = useCatalogStore((state) => state.error);
  const retryAttempt = useCatalogStore((state) => state.retryAttempt);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const category = useCatalogStore((state) => state.filters.category);
  const select = useCatalogStore((state) => state.select);
  const view = useCatalogStore((state) => state.view);
  const all = useAllProducts();
  const visible = useVisibleProducts();

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const loading = status === "idle" || status === "loading";

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 pb-1 pt-3 sm:px-6">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
              <SearchBar resultCount={visible.length} />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:-mt-4">
              <Link
                href="/products/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-bold text-accent-ink shadow-sm hover:opacity-90"
              >
                <span aria-hidden className="text-base leading-none">+</span>
                <span>Add product</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Inventory</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {category ? slugToLabel(category) : "All products"}
            </h1>
          </div>

          <SectionBoundary name="Stats">
            {loading && all.length === 0 ? <StatsSkeleton /> : <StatsRow products={category ? visible : all} />}
          </SectionBoundary>

          {status === "error" && (
            <ErrorPanel title="Couldn't load the catalog" message={error ?? "Unknown error"} onRetry={() => void loadCatalog({ force: true })} />
          )}

          {!loading && status !== "error" && <FilterBar resultCount={visible.length} />}

          <SectionBoundary name="Product grid">
            {loading ? (
              <>
                {retryAttempt > 0 && (
                  <p className="mb-3 text-sm text-warn" aria-live="polite">
                    Connection is slow, retrying (attempt {retryAttempt + 1} of 3)…
                  </p>
                )}
                <ProductGridSkeleton />
              </>
            ) : visible.length === 0 ? (
              status === "ready" && <EmptyState />
            ) : view === "table" ? (
              <ProductTable products={visible} onSelect={select} />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visible.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} onSelect={select} />
                  </li>
                ))}
              </ul>
            )}
          </SectionBoundary>
        </main>
      </div>
    </div>
  );
}
