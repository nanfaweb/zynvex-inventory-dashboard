"use client";

import { useMemo } from "react";
import { applyFilters } from "@/lib/filter";
import { deriveCategories, deriveTags } from "@/lib/parse";
import type { Product } from "@/lib/types";
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

function matchesLocally(product: Product, query: string) {
  const haystack = [product.title, product.brand, product.sku, product.category, ...product.tags].join(" ").toLowerCase();
  return query.split(" ").every((word) => haystack.includes(word));
}

/** Search narrows first (server ids for catalog items, text match for local ones), then filters apply. */
export function useVisibleProducts() {
  const products = useAllProducts();
  const filters = useCatalogStore((state) => state.filters);
  const search = useCatalogStore((state) => state.search);
  return useMemo(() => {
    let pool = products;
    if (search.query && search.ids) {
      const ids = new Set(search.ids);
      pool = products.filter((p) => (p.source === "local" ? matchesLocally(p, search.query) : ids.has(p.id)));
    }
    return applyFilters(pool, filters);
  }, [products, filters, search.query, search.ids]);
}
