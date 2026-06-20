"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-catalog";
import { useCatalogStore } from "@/store/catalog-store";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-ink text-canvas">
        <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
          <path d="M3 4.5 10 1l7 3.5v11L10 19l-7-3.5v-11Zm7 2.3L5.2 4.5 10 2.1l4.8 2.4L10 6.8Zm-5.5-.9v8.9l4.8 2.4V8.3L4.5 5.9Zm6.2 11.3 4.8-2.4V5.9l-4.8 2.4v8.9Z" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight">Stockroom</span>
    </Link>
  );
}

export function Sidebar() {
  const categories = useCategories();
  const status = useCatalogStore((state) => state.status);
  const active = useCatalogStore((state) => state.filters.category);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const max = Math.max(1, ...categories.map((c) => c.count));

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
      <div className="sticky top-0 flex h-dvh flex-col">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo />
        </div>
        <nav aria-label="Categories" className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Categories</p>
          <ul className="mt-2 space-y-0.5">
            <li>
              <CategoryButton label="All products" count={total} share={1} active={active === null} onClick={() => setCategory(null)} />
            </li>
            {status !== "ready" && categories.length === 0
              ? Array.from({ length: 10 }, (_, i) => (
                  <li key={i} className="mx-2 my-2 h-5 animate-pulse rounded bg-line/70" />
                ))
              : categories.map((category) => (
                  <li key={category.slug}>
                    <CategoryButton
                      label={category.label}
                      count={category.count}
                      share={category.count / max}
                      active={active === category.slug}
                      onClick={() => setCategory(active === category.slug ? null : category.slug)}
                    />
                  </li>
                ))}
          </ul>
        </nav>
        <div className="border-t border-line p-4 text-xs text-muted">
          Live data from the DummyJSON products API.
        </div>
      </div>
    </aside>
  );
}

function CategoryButton({
  label,
  count,
  share,
  active,
  onClick,
}: {
  label: string;
  count: number;
  share: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
        active ? "bg-accent-soft font-bold text-accent" : "text-ink-soft hover:bg-surface-2"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-1 left-0 rounded-r ${active ? "bg-accent" : "bg-line group-hover:bg-muted/40"}`}
        style={{ width: 3, opacity: 0.4 + share * 0.6 }}
      />
      <span className="truncate pl-1">{label}</span>
      <span className="tabular ml-2 font-mono text-xs text-muted">{count}</span>
    </button>
  );
}
