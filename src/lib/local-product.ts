import { stockStatusFor, toMoney } from "./parse";
import type { ProductFormValues } from "./product-schema";
import type { Product } from "./types";

function skuFor(values: ProductFormValues, suffix: string) {
  const part = (text: string) => text.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  return `${part(values.category)}-${part(values.brand || "GEN")}-${suffix}`;
}

/** Turns validated form values into a full domain product, created in this browser. */
export function productFromForm(values: ProductFormValues, now = new Date(), id = crypto.randomUUID()): Product {
  const short = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return {
    id: `local-${id}`,
    sku: skuFor(values, short),
    title: values.title,
    description: values.description,
    brand: values.brand || "Unbranded",
    category: values.category,
    tags: values.tags,
    price: toMoney(values.price),
    salePrice: toMoney(values.price * (1 - values.discountPercent / 100)),
    discountPercent: values.discountPercent,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    stock: values.stock,
    stockStatus: stockStatusFor(values.stock),
    minimumOrder: values.minimumOrder,
    weightKg: 0,
    dimensionsCm: { width: 0, height: 0, depth: 0 },
    warranty: "No warranty",
    shipping: "Ships in 3-5 business days",
    thumbnail: values.thumbnail,
    images: values.thumbnail ? [values.thumbnail] : [],
    createdAt: now,
    updatedAt: now,
    source: "local",
  };
}
