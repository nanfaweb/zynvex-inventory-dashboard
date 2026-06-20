"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useCatalogStore } from "@/store/catalog-store";

const DEBOUNCE_MS = 300;

function subscribeMinute(callback: () => void) {
  const id = window.setInterval(callback, 30_000);
  return () => window.clearInterval(id);
}

function useNow() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 30_000) * 30_000, () => 0);
}

function timeAgo(at: number, now: number) {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export function SearchBar({ resultCount }: { resultCount: number }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useCatalogStore((state) => state.search);
  const runSearch = useCatalogStore((state) => state.runSearch);
  const clearSearch = useCatalogStore((state) => state.clearSearch);
  const now = useNow();

  // Debounce keystrokes: only search once typing pauses.
  useEffect(() => {
    const id = window.setTimeout(() => void runSearch(value), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [value, runSearch]);

  // "/" focuses the search from anywhere, like most dashboards.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = search.query !== "" && value.trim() !== "";

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 4 4" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setValue("");
              clearSearch();
            }
          }}
          placeholder="Search products, brands, tags…"
          aria-label="Search products"
          aria-describedby="search-status"
          className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-16 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                clearSearch();
                inputRef.current?.focus();
              }}
              className="rounded px-1.5 py-0.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-ink"
            >
              Clear
            </button>
          ) : (
            <kbd className="hidden rounded border border-line px-1.5 font-mono text-[11px] text-muted sm:inline">/</kbd>
          )}
        </div>
      </div>
      <p id="search-status" aria-live="polite" className="mt-1 h-4 truncate text-[11px] text-muted">
        {active && search.status === "searching" && "Searching…"}
        {active && search.status === "error" && <span className="text-danger">Search is unavailable right now. Showing all products.</span>}
        {active && search.status === "done" && (
          <>
            {resultCount} result{resultCount === 1 ? "" : "s"} for &ldquo;{search.query}&rdquo; ·{" "}
            {search.source === "cache" ? (
              <span className="font-semibold text-accent">cached {search.cachedAt && now ? timeAgo(search.cachedAt, now) : ""}</span>
            ) : (
              <span>live</span>
            )}
            <span className="hidden sm:inline">
              {" "}· cache {search.hits} hit{search.hits === 1 ? "" : "s"} / {search.misses} miss{search.misses === 1 ? "" : "es"}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
