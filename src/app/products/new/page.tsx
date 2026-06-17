import type { Metadata } from "next";
import { NewProduct } from "./new-product";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Add a product</h1>
      <p className="mt-2 text-muted">New items are saved to this browser and appear alongside the live catalog.</p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-8">
        <NewProduct />
      </div>
    </main>
  );
}
