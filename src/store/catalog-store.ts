import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ApiError, fetchCatalog, searchCatalog, withRetry } from "@/lib/api";
import { defaultFilters, type Filters, type SortKey } from "@/lib/filter";
import { createSearchCache, normaliseQuery, type SearchCache } from "@/lib/search-cache";
import type { ParseIssue, Product, StockStatus } from "@/lib/types";

/* ---------- Catalog slice: the data ---------- */

export type LoadStatus = "idle" | "loading" | "ready" | "error";

export interface CatalogSlice {
  catalog: Product[];
  localProducts: Product[];
  status: LoadStatus;
  error: string | null;
  issues: ParseIssue[];
  loadedAt: number | null;
  /** Which automatic retry is running (0 when not retrying). */
  retryAttempt: number;
  loadCatalog: (options?: { force?: boolean }) => Promise<void>;
  setCatalog: (products: Product[], issues: ParseIssue[]) => void;
  setStatus: (status: LoadStatus, error?: string | null) => void;
  addLocalProduct: (product: Product) => void;
  removeLocalProduct: (id: string) => void;
}

/* ---------- Filter slice: what the user is looking at ---------- */

export interface FilterSlice {
  filters: Filters;
  setCategory: (category: string | null) => void;
  toggleTag: (tag: string) => void;
  setStockFilter: (stock: StockStatus | "all") => void;
  setSort: (sort: SortKey) => void;
  clearFilters: () => void;
}

/* ---------- UI slice: view state ---------- */

export type ViewMode = "grid" | "table";

export interface UiSlice {
  view: ViewMode;
  selectedId: string | null;
  setView: (view: ViewMode) => void;
  select: (id: string | null) => void;
}

/* ---------- Search slice: server search with a local cache ---------- */

export interface SearchState {
  query: string;
  status: "idle" | "searching" | "done" | "error";
  /** Matching catalog ids, or null when no search is active. */
  ids: string[] | null;
  source: "cache" | "network" | null;
  cachedAt: number | null;
  hits: number;
  misses: number;
}

export interface SearchSlice {
  search: SearchState;
  runSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export type CatalogStore = CatalogSlice & FilterSlice & UiSlice & SearchSlice;

type Slice<T> = StateCreator<CatalogStore, [["zustand/persist", unknown]], [], T>;

let inFlight: Promise<void> | null = null;

const createCatalogSlice: Slice<CatalogSlice> = (set, get) => ({
  catalog: [],
  localProducts: [],
  status: "idle",
  error: null,
  issues: [],
  loadedAt: null,
  retryAttempt: 0,
  loadCatalog: ({ force = false } = {}) => {
    // Several components can ask for the catalog at once; share one request.
    if (inFlight) return inFlight;
    if (!force && get().status === "ready") return Promise.resolve();

    set({ status: "loading", error: null, retryAttempt: 0 });
    inFlight = withRetry(() => fetchCatalog(), {
      onRetry: (attempt) => set({ retryAttempt: attempt }),
    })
      .then(({ products, issues }) => get().setCatalog(products, issues))
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : "Something went wrong while loading the catalog";
        set({ status: "error", error: message, retryAttempt: 0 });
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  },
  setCatalog: (catalog, issues) =>
    set({ catalog, issues, status: "ready", error: null, loadedAt: Date.now(), retryAttempt: 0 }),
  setStatus: (status, error = null) => set({ status, error }),
  addLocalProduct: (product) => set((state) => ({ localProducts: [product, ...state.localProducts] })),
  removeLocalProduct: (id) =>
    set((state) => ({
      localProducts: state.localProducts.filter((product) => product.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
});

const createFilterSlice: Slice<FilterSlice> = (set) => ({
  filters: defaultFilters,
  setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  toggleTag: (tag) =>
    set((state) => {
      const tags = state.filters.tags.includes(tag)
        ? state.filters.tags.filter((t) => t !== tag)
        : [...state.filters.tags, tag];
      return { filters: { ...state.filters, tags } };
    }),
  setStockFilter: (stock) => set((state) => ({ filters: { ...state.filters, stock } })),
  setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),
  clearFilters: () => set((state) => ({ filters: { ...defaultFilters, sort: state.filters.sort } })),
});

const createUiSlice: Slice<UiSlice> = (set) => ({
  view: "grid",
  selectedId: null,
  setView: (view) => set({ view }),
  select: (selectedId) => set({ selectedId }),
});

const idleSearch: SearchState = {
  query: "",
  status: "idle",
  ids: null,
  source: null,
  cachedAt: null,
  hits: 0,
  misses: 0,
};

let searchCache: SearchCache | null = null;
let searchController: AbortController | null = null;

function getSearchCache() {
  searchCache ??= createSearchCache({ storage: typeof window === "undefined" ? null : window.localStorage });
  return searchCache;
}

const createSearchSlice: Slice<SearchSlice> = (set, get) => ({
  search: idleSearch,
  clearSearch: () => {
    searchController?.abort();
    set((state) => ({ search: { ...idleSearch, hits: state.search.hits, misses: state.search.misses } }));
  },
  runSearch: async (raw) => {
    const query = normaliseQuery(raw);
    if (!query) return get().clearSearch();

    const cached = getSearchCache().get(query);
    if (cached) {
      searchController?.abort();
      set((state) => ({
        search: { ...state.search, query, status: "done", ids: cached.ids, source: "cache", cachedAt: cached.at, hits: state.search.hits + 1 },
      }));
      return;
    }

    // A newer keystroke cancels the older request, so results never arrive out of order.
    searchController?.abort();
    const controller = new AbortController();
    searchController = controller;
    set((state) => ({ search: { ...state.search, query, status: "searching", misses: state.search.misses + 1 } }));

    try {
      const { products } = await searchCatalog(query, { signal: controller.signal });
      const ids = products.map((p) => p.id);
      getSearchCache().set(query, ids);
      set((state) => ({ search: { ...state.search, status: "done", ids, source: "network", cachedAt: Date.now() } }));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return;
      set((state) => ({ search: { ...state.search, status: "error", ids: null, source: null } }));
    }
  },
});

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (...args) => ({
      ...createCatalogSlice(...args),
      ...createFilterSlice(...args),
      ...createUiSlice(...args),
      ...createSearchSlice(...args),
    }),
    {
      name: "stockroom:catalog",
      version: 1,
      // Only things the user created or chose. The live catalog is always refetched.
      partialize: (state) => ({ localProducts: state.localProducts, view: state.view }),
      storage: createJSONStorage(() => localStorage, {
        // Products carry Date objects; JSON turns them into ISO strings, so turn them back.
        reviver: (_key, value) => (typeof value === "string" && ISO_DATE.test(value) ? new Date(value) : value),
      }),
      // Rehydrated from <StoreHydrator /> after mount, so server and first client render match.
      skipHydration: true,
    },
  ),
);
