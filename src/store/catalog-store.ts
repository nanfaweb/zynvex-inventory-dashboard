import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultFilters, type Filters, type SortKey } from "@/lib/filter";
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

export type CatalogStore = CatalogSlice & FilterSlice & UiSlice;

type Slice<T> = StateCreator<CatalogStore, [["zustand/persist", unknown]], [], T>;

const createCatalogSlice: Slice<CatalogSlice> = (set) => ({
  catalog: [],
  localProducts: [],
  status: "idle",
  error: null,
  issues: [],
  loadedAt: null,
  setCatalog: (catalog, issues) => set({ catalog, issues, status: "ready", error: null, loadedAt: Date.now() }),
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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (...args) => ({
      ...createCatalogSlice(...args),
      ...createFilterSlice(...args),
      ...createUiSlice(...args),
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
