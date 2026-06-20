"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProductThumb } from "@/components/dashboard/product-card";
import { StockBadge } from "@/components/ui/stock-badge";
import { useAllProducts } from "@/hooks/use-catalog";
import { formatMoney } from "@/lib/format";
import { slugToLabel } from "@/lib/parse";
import type { Product } from "@/lib/types";
import { useCatalogStore } from "@/store/catalog-store";

export function ProductDrawer() {
  const selectedId = useCatalogStore((state) => state.selectedId);
  const select = useCatalogStore((state) => state.select);
  const products = useAllProducts();
  const product = products.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    if (!product) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") select(null);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [product, select]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close details" onClick={() => select(null)} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-surface shadow-2xl motion-safe:animate-[slide-in_200ms_ease-out]"
      >
        <DrawerBody key={product.id} product={product} onClose={() => select(null)} />
      </aside>
    </div>
  );
}

function DrawerBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const removeLocalProduct = useCatalogStore((state) => state.removeLocalProduct);
  const toggleTag = useCatalogStore((state) => state.toggleTag);
  const [imageIndex, setImageIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = product.images[imageIndex] ?? product.thumbnail;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const details: [string, string][] = [
    ["SKU", product.sku],
    ["Minimum order", `${product.minimumOrder} unit${product.minimumOrder === 1 ? "" : "s"}`],
    ["Weight", product.weightKg ? `${product.weightKg} kg` : "—"],
    [
      "Dimensions",
      product.dimensionsCm.width ? `${product.dimensionsCm.width} × ${product.dimensionsCm.height} × ${product.dimensionsCm.depth} cm` : "—",
    ],
    ["Warranty", product.warranty],
    ["Shipping", product.shipping || "—"],
  ];

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{slugToLabel(product.category)}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg text-xl leading-none text-muted hover:bg-surface-2 hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-line bg-surface-2">
          {image && product.source === "catalog" ? (
            <div className="relative aspect-[4/3]">
              <Image src={image} alt={product.title} fill sizes="512px" className="object-contain p-6 mix-blend-multiply dark:mix-blend-normal" />
            </div>
          ) : (
            <ProductThumb product={product} sizes="512px" className="aspect-[4/3]" />
          )}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-5 pb-4">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === imageIndex}
                  className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 bg-surface ${i === imageIndex ? "border-accent" : "border-transparent"}`}
                >
                  <Image src={src} alt="" fill sizes="56px" unoptimized={product.source === "local"} className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 p-5">
          <div>
            <h2 id="drawer-title" className="text-xl font-extrabold leading-tight">{product.title}</h2>
            <p className="mt-1 text-sm text-muted">{product.brand}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="tabular font-mono text-2xl font-bold">{formatMoney(product.salePrice)}</span>
              {product.discountPercent >= 1 && (
                <>
                  <span className="tabular font-mono text-sm text-muted line-through">{formatMoney(product.price)}</span>
                  <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-bold text-accent">−{product.discountPercent}%</span>
                </>
              )}
              <span className="ml-auto">
                <StockBadge status={product.stockStatus} stock={product.stock} />
              </span>
            </div>
          </div>

          {product.description && <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>}

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    toggleTag(tag);
                    onClose();
                  }}
                  className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-accent hover:text-accent"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="bg-surface p-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-0.5 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="reviews-heading">
            <div className="flex items-baseline justify-between">
              <h3 id="reviews-heading" className="font-bold">Reviews</h3>
              {product.rating > 0 && (
                <span className="tabular font-mono text-sm text-muted">★ {product.rating.toFixed(2)} · {product.reviewCount}</span>
              )}
            </div>
            {product.reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No reviews yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {product.reviews.map((review, i) => (
                  <li key={i} className="rounded-xl bg-surface-2 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{review.author}</span>
                      <span className="text-accent" aria-label={`${review.rating} out of 5 stars`}>
                        {"★".repeat(Math.round(review.rating))}
                        <span className="text-line">{"★".repeat(5 - Math.round(review.rating))}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-ink-soft">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {product.source === "local" && (
        <div className="border-t border-line p-4">
          {confirming ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">Delete this product from your catalog?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirming(false)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-surface-2">
                  Keep
                </button>
                <button
                  type="button"
                  onClick={() => removeLocalProduct(product.id)}
                  className="rounded-lg bg-danger px-3 py-2 text-sm font-bold text-white hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="w-full rounded-lg border border-danger/40 px-3 py-2 text-sm font-bold text-danger hover:bg-danger-soft">
              Delete product
            </button>
          )}
        </div>
      )}
    </>
  );
}
