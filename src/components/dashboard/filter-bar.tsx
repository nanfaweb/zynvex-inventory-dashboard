"use client";

import { useState } from "react";
import { stockLabels } from "@/components/ui/stock-badge";
import { useCategories, useTagCounts } from "@/hooks/use-catalog";
import { activeFilterCount, sortLabels, type SortKey } from "@/lib/filter";
import type { StockStatus } from "@/lib/types";
import { useCatalogStore } from "@/store/catalog-store";

const TAG_PREVIEW = 14;
const MOBILE_TAG_PREVIEW = 6;
const stockOptions = ["all", "in-stock", "low-stock", "out-of-stock"] as const;

export function FilterBar({ resultCount }: { resultCount: number }) {
  const filters = useCatalogStore((state) => state.filters);
  const view = useCatalogStore((state) => state.view);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const toggleTag = useCatalogStore((state) => state.toggleTag);
  const setStockFilter = useCatalogStore((state) => state.setStockFilter);
  const setSort = useCatalogStore((state) => state.setSort);
  const setView = useCatalogStore((state) => state.setView);
  const clearFilters = useCatalogStore((state) => state.clearFilters);
  const categories = useCategories();
  const tagCounts = useTagCounts();
  const [showAllTags, setShowAllTags] = useState(false);

  // Keep selected tags visible even when they fall outside the preview.
  const preview = showAllTags ? tagCounts : tagCounts.slice(0, TAG_PREVIEW);
  const hiddenSelected = tagCounts.filter((t) => filters.tags.includes(t.tag) && !preview.includes(t));
  const shownTags = [...hiddenSelected, ...preview];
  const activeCount = activeFilterCount(filters);

  return (
    <section aria-label="Filters" className="space-y-3 rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="lg:hidden">
          <span className="sr-only">Category</span>
          <select
            value={filters.category ?? ""}
            onChange={(event) => setCategory(event.target.value || null)}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm font-semibold"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label} ({c.count})
              </option>
            ))}
          </select>
        </label>

        <div role="radiogroup" aria-label="Stock level" className="no-scrollbar flex max-w-full overflow-x-auto rounded-lg bg-surface-2 p-0.5 ring-1 ring-line">
          {stockOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={filters.stock === option}
              onClick={() => setStockFilter(option as StockStatus | "all")}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                filters.stock === option ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"
              }`}
            >
              {stockLabels[option]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-muted">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={filters.sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-lg border border-line bg-surface-2 px-2.5 py-2 text-sm font-semibold text-ink"
            >
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {sortLabels[key]}
                </option>
              ))}
            </select>
          </label>
          <div role="radiogroup" aria-label="Layout" className="flex rounded-lg bg-surface-2 p-0.5 ring-1 ring-line">
            {(["grid", "table"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={view === mode}
                aria-label={mode === "grid" ? "Grid view" : "Table view"}
                onClick={() => setView(mode)}
                className={`grid size-8 place-items-center rounded-md ${view === mode ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
              >
                {mode === "grid" ? (
                  <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                    <rect x="1" y="1" width="6" height="6" rx="1.5" />
                    <rect x="9" y="1" width="6" height="6" rx="1.5" />
                    <rect x="1" y="9" width="6" height="6" rx="1.5" />
                    <rect x="9" y="9" width="6" height="6" rx="1.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                    <rect x="1" y="2" width="14" height="2.5" rx="1" />
                    <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
                    <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shownTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tags">
          {shownTags.map(({ tag, count }, index) => {
            const selected = filters.tags.includes(tag);
            // On phones the preview is shorter so filters don't push products off screen.
            const phoneHidden = !showAllTags && !selected && index >= MOBILE_TAG_PREVIEW ? "max-sm:hidden" : "";
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTag(tag)}
                className={`${phoneHidden} rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selected ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-soft hover:border-accent/50 hover:text-accent"
                }`}
              >
                #{tag}
                <span className={`ml-1 font-mono ${selected ? "opacity-80" : "text-muted"}`}>{count}</span>
              </button>
            );
          })}
          {tagCounts.length > MOBILE_TAG_PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAllTags((v) => !v)}
              className={`px-2 py-1 text-xs font-bold text-accent hover:underline ${tagCounts.length <= TAG_PREVIEW ? "sm:hidden" : ""}`}
            >
              {showAllTags ? "Fewer tags" : `All ${tagCounts.length} tags`}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span aria-live="polite">
          Showing <strong className="tabular font-mono text-ink">{resultCount}</strong> product{resultCount === 1 ? "" : "s"}
          {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} on`}
        </span>
        {activeCount > 0 && (
          <button type="button" onClick={clearFilters} className="font-bold text-accent hover:underline">
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
