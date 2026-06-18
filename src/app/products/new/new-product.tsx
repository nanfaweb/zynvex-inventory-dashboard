"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { KNOWN_CATEGORIES } from "@/lib/categories";
import { productFromForm } from "@/lib/local-product";
import type { ProductFormValues } from "@/lib/product-schema";
import { useCatalogStore } from "@/store/catalog-store";

export function NewProduct() {
  const router = useRouter();
  const addLocalProduct = useCatalogStore((state) => state.addLocalProduct);
  const select = useCatalogStore((state) => state.select);

  function handleSubmit(values: ProductFormValues) {
    const product = productFromForm(values);
    addLocalProduct(product);
    select(product.id);
    router.push("/");
  }

  return <ProductForm categories={[...KNOWN_CATEGORIES]} onSubmit={handleSubmit} onCancel={() => router.push("/")} />;
}
