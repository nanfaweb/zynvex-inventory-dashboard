"use client";

import { useCatalogStore } from "@/store/catalog-store";

export function EmptyState() {
  const clearFilters = useCatalogStore((state) => state.clearFilters);
  const query = useCatalogStore((state) => state.search.query);

  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <div aria-hidden className="grid size-12 place-items-center rounded-full bg-accent-soft text-xl text-accent">∅</div>
      <p className="mt-4 text-lg font-bold">No products match</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        {query ? `Nothing for "${query}" with the current filters.` : "Nothing fits the current filters."} Try removing a tag or changing the stock level.
      </p>
      <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-canvas hover:opacity-90">
        Clear filters
      </button>
    </div>
  );
}
