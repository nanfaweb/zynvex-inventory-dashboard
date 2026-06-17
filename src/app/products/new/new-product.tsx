"use client";

import { useState } from "react";
import { ProductForm } from "@/components/product-form";
import { KNOWN_CATEGORIES } from "@/lib/categories";
import type { ProductFormValues } from "@/lib/product-schema";

export function NewProduct() {
  const [saved, setSaved] = useState<ProductFormValues | null>(null);

  if (saved) {
    return (
      <div className="space-y-4">
        <p className="font-semibold">Validated payload</p>
        <pre className="overflow-x-auto rounded-lg bg-surface-2 p-4 font-mono text-xs">{JSON.stringify(saved, null, 2)}</pre>
        <button type="button" onClick={() => setSaved(null)} className="text-sm font-semibold text-accent">
          Add another
        </button>
      </div>
    );
  }

  return <ProductForm categories={[...KNOWN_CATEGORIES]} onSubmit={setSaved} />;
}
