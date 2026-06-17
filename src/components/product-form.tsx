"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  emptyProductForm,
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/product-schema";
import { slugToLabel } from "@/lib/parse";
import { Field, inputClass } from "@/components/ui/field";
import { TagInput } from "@/components/ui/tag-input";
import { formatMoney } from "@/lib/format";

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
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...emptyProductForm, ...defaultValues },
    mode: "onTouched",
  });

  const [price, discount] = useWatch({ control, name: ["price", "discountPercent"] });
  const hasPrice = Number.isFinite(price) && price > 0;
  const safeDiscount = Number.isFinite(discount) ? Math.min(Math.max(discount, 0), 90) : 0;
  const salePrice = hasPrice ? price * (1 - safeDiscount / 100) : 0;

  const errorCount = Object.keys(errors).filter((key) => key !== "root").length;

  async function submit(values: ProductFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Couldn't save the product. Try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-5 sm:grid-cols-6">
      {(errors.root || (submitCount > 0 && errorCount > 0)) && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm sm:col-span-6">
          {errors.root?.message ??
            `Fix ${errorCount} field${errorCount === 1 ? "" : "s"} before saving.`}
        </div>
      )}

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

      <div className="rounded-lg border border-dashed border-line bg-surface-2 px-4 py-3 text-sm sm:col-span-6" aria-live="polite">
        {hasPrice ? (
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-muted">Customers pay</span>
            <span className="tabular font-mono text-lg font-bold">{formatMoney(salePrice)}</span>
            {safeDiscount > 0 && (
              <>
                <span className="tabular font-mono text-muted line-through">{formatMoney(price)}</span>
                <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-bold text-accent">−{safeDiscount}%</span>
              </>
            )}
          </span>
        ) : (
          <span className="text-muted">Enter a price to preview what customers pay.</span>
        )}
      </div>

      <Field label="Tags" hint="Press Enter or comma to add" error={errors.tags?.message} className="sm:col-span-6" optional>
        {(id, describedBy) => (
          <Controller
            control={control}
            name="tags"
            render={({ field, fieldState }) => (
              <TagInput
                id={id}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(fieldState.error)}
                describedBy={describedBy}
                placeholder="lighting, desk, walnut"
              />
            )}
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
