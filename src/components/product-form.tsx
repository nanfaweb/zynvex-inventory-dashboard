"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  emptyProductForm,
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/product-schema";
import { slugToLabel } from "@/lib/parse";
import { Field, inputClass } from "@/components/ui/field";

type ProductFormProps = {
  categories: string[];
  defaultValues?: Partial<ProductFormInput>;
  submitLabel?: string;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

export function ProductForm({
  categories,
  defaultValues,
  submitLabel = "Add product",
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...emptyProductForm, ...defaultValues },
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-6">
      <Field label="Product name" error={errors.title?.message} className="sm:col-span-4">
        {(id, describedBy) => (
          <input id={id} aria-describedby={describedBy} {...register("title")} className={inputClass(errors.title)} placeholder="Walnut desk lamp" />
        )}
      </Field>

      <Field label="Brand" error={errors.brand?.message} className="sm:col-span-2" optional>
        {(id, describedBy) => (
          <input id={id} aria-describedby={describedBy} {...register("brand")} className={inputClass(errors.brand)} placeholder="Lumen & Co" />
        )}
      </Field>

      <Field label="Category" error={errors.category?.message} className="sm:col-span-2">
        {(id, describedBy) => (
          <select id={id} aria-describedby={describedBy} {...register("category")} className={inputClass(errors.category)}>
            <option value="">Select…</option>
            {categories.map((slug) => (
              <option key={slug} value={slug}>
                {slugToLabel(slug)}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Price (USD)" error={errors.price?.message} className="sm:col-span-2">
        {(id, describedBy) => (
          <input
            id={id}
            aria-describedby={describedBy}
            type="number"
            inputMode="decimal"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className={inputClass(errors.price)}
            placeholder="49.00"
          />
        )}
      </Field>

      <Field label="Discount %" error={errors.discountPercent?.message} className="sm:col-span-2">
        {(id, describedBy) => (
          <input
            id={id}
            aria-describedby={describedBy}
            type="number"
            inputMode="decimal"
            step="0.5"
            {...register("discountPercent", { valueAsNumber: true })}
            className={inputClass(errors.discountPercent)}
          />
        )}
      </Field>

      <Field label="Units in stock" error={errors.stock?.message} className="sm:col-span-3">
        {(id, describedBy) => (
          <input
            id={id}
            aria-describedby={describedBy}
            type="number"
            inputMode="numeric"
            {...register("stock", { valueAsNumber: true })}
            className={inputClass(errors.stock)}
          />
        )}
      </Field>

      <Field label="Minimum order" error={errors.minimumOrder?.message} className="sm:col-span-3">
        {(id, describedBy) => (
          <input
            id={id}
            aria-describedby={describedBy}
            type="number"
            inputMode="numeric"
            {...register("minimumOrder", { valueAsNumber: true })}
            className={inputClass(errors.minimumOrder)}
          />
        )}
      </Field>

      <Field label="Tags" hint="Comma separated" error={errors.tags?.message} className="sm:col-span-6" optional>
        {(id, describedBy) => (
          <input
            id={id}
            aria-describedby={describedBy}
            {...register("tags", {
              setValueAs: (value: string | string[]) =>
                Array.isArray(value)
                  ? value
                  : value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
            })}
            className={inputClass(errors.tags)}
            placeholder="lighting, desk, walnut"
          />
        )}
      </Field>

      <Field label="Description" error={errors.description?.message} className="sm:col-span-6" optional>
        {(id, describedBy) => (
          <textarea id={id} aria-describedby={describedBy} rows={3} {...register("description")} className={`${inputClass(errors.description)} resize-y`} />
        )}
      </Field>

      <Field label="Image URL" error={errors.thumbnail?.message} className="sm:col-span-6" optional>
        {(id, describedBy) => (
          <input id={id} aria-describedby={describedBy} type="url" {...register("thumbnail")} className={inputClass(errors.thumbnail)} placeholder="https://…" />
        )}
      </Field>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5 sm:col-span-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-2">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
