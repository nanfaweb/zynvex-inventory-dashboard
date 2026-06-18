import type { Product, StockStatus } from "./types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "stock-asc" | "newest";

export const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  "stock-asc": "Lowest stock",
  newest: "Newest",
};

export interface Filters {
  category: string | null;
  tags: string[];
  stock: StockStatus | "all";
  sort: SortKey;
}

export const defaultFilters: Filters = {
  category: null,
  tags: [],
  stock: "all",
  sort: "featured",
};

const comparators: Record<SortKey, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.salePrice.cents - b.salePrice.cents,
  "price-desc": (a, b) => b.salePrice.cents - a.salePrice.cents,
  rating: (a, b) => b.rating - a.rating,
  "stock-asc": (a, b) => a.stock - b.stock,
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
};

/** Applies category, tag (match all), stock and sort filters. Pure, so it is easy to test and memoise. */
export function applyFilters(products: readonly Product[], filters: Filters): Product[] {
  const result = products.filter(
    (product) =>
      (filters.category === null || product.category === filters.category) &&
      (filters.stock === "all" || product.stockStatus === filters.stock) &&
      filters.tags.every((tag) => product.tags.includes(tag)),
  );
  const compare = comparators[filters.sort];
  return compare ? result.sort(compare) : result;
}

export function activeFilterCount(filters: Filters): number {
  return (filters.category ? 1 : 0) + filters.tags.length + (filters.stock === "all" ? 0 : 1);
}
