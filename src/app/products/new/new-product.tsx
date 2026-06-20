"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ProductForm } from "@/components/product-form";
import { useCategories } from "@/hooks/use-catalog";
import { KNOWN_CATEGORIES } from "@/lib/categories";
import { productFromForm } from "@/lib/local-product";
import type { ProductFormValues } from "@/lib/product-schema";
import { useCatalogStore } from "@/store/catalog-store";

export function NewProduct() {
  const router = useRouter();
  const addLocalProduct = useCatalogStore((state) => state.addLocalProduct);
  const select = useCatalogStore((state) => state.select);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const live = useCategories();

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  // Live categories once the catalog is in, the published list until then.
  const categories = useMemo(
    () => Array.from(new Set([...live.map((c) => c.slug), ...KNOWN_CATEGORIES])).sort(),
    [live],
  );

  function handleSubmit(values: ProductFormValues) {
    const product = productFromForm(values);
    addLocalProduct(product);
    select(product.id);
    router.push("/");
  }

  return <ProductForm categories={categories} onSubmit={handleSubmit} onCancel={() => router.push("/")} />;
}
