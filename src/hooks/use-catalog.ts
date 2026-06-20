"use client";

import { useMemo } from "react";
import { applyFilters } from "@/lib/filter";
import { deriveCategories, deriveTags } from "@/lib/parse";
import { useCatalogStore } from "@/store/catalog-store";

/** Local products first, then the live catalog. */
export function useAllProducts() {
  const catalog = useCatalogStore((state) => state.catalog);
  const localProducts = useCatalogStore((state) => state.localProducts);
  return useMemo(() => [...localProducts, ...catalog], [localProducts, catalog]);
}

export function useCategories() {
  const products = useAllProducts();
  return useMemo(() => deriveCategories(products), [products]);
}

/** Tags available within the current category, so chips never lead to an empty grid. */
export function useTagCounts() {
  const products = useAllProducts();
  const category = useCatalogStore((state) => state.filters.category);
  return useMemo(
    () => deriveTags(category ? products.filter((p) => p.category === category) : products),
    [products, category],
  );
}

export function useVisibleProducts() {
  const products = useAllProducts();
  const filters = useCatalogStore((state) => state.filters);
  return useMemo(() => applyFilters(products, filters), [products, filters]);
}
