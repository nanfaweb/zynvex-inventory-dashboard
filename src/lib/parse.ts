import type {
  Category,
  Money,
  ParseIssue,
  ParseResult,
  Product,
  RawProduct,
  RawProductPage,
  StockStatus,
} from "./types";

export const LOW_STOCK_THRESHOLD = 10;

/* ---------- Small typed guards ---------- */

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, field: string, fallback?: string): string {
  if (typeof value === "string") return value.trim();
  if (fallback !== undefined) return fallback;
  throw new ParseError(`"${field}" must be a string`);
}

function num(value: unknown, field: string, fallback?: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  if (fallback !== undefined) return fallback;
  throw new ParseError(`"${field}" must be a number`);
}

function date(value: unknown, fallback: Date): Date {
  if (typeof value !== "string") return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/* ---------- Higher-order mapper ---------- */

/**
 * Lifts a single-item mapper into a feed mapper. Bad rows are collected
 * as issues instead of failing the whole feed.
 */
export function mapFeed<Raw, Out>(mapper: (raw: Raw, index: number) => Out) {
  return (rows: readonly unknown[]): ParseResult<Out> => {
    const items: Out[] = [];
    const issues: ParseIssue[] = [];
    rows.forEach((row, index) => {
      try {
        items.push(mapper(row as Raw, index));
      } catch (error) {
        issues.push({
          index,
          id: isRecord(row) ? row.id : undefined,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    });
    return { items, issues };
  };
}

/* ---------- Domain helpers ---------- */

export function toMoney(amount: number): Money {
  return { cents: Math.round(amount * 100), currency: "USD" };
}

export function stockStatusFor(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export function slugToLabel(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function normaliseTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

/* ---------- Product mapper ---------- */

export function parseProduct(raw: RawProduct): Product {
  if (!isRecord(raw)) throw new ParseError("row is not an object");

  const id = num(raw.id, "id");
  const price = num(raw.price, "price");
  if (price < 0) throw new ParseError(`"price" cannot be negative`);
  const discountPercent = Math.min(Math.max(num(raw.discountPercentage, "discountPercentage", 0), 0), 100);
  const stock = Math.max(Math.trunc(num(raw.stock, "stock", 0)), 0);
  const now = new Date(0);
  const createdAt = date(isRecord(raw.meta) ? raw.meta.createdAt : undefined, now);
  const reviews = Array.isArray(raw.reviews)
    ? raw.reviews.filter(isRecord).map((review) => ({
        rating: num(review.rating, "reviews.rating", 0),
        comment: str(review.comment, "reviews.comment", ""),
        author: str(review.reviewerName, "reviews.reviewerName", "Anonymous"),
        date: date(review.date, createdAt),
      }))
    : [];
  const dimensions: Record<string, unknown> = isRecord(raw.dimensions) ? raw.dimensions : {};
  const category = str(raw.category, "category");
  const images = strings(raw.images);

  return {
    id: `catalog-${id}`,
    sku: str(raw.sku, "sku", `SKU-${id}`),
    title: str(raw.title, "title"),
    description: str(raw.description, "description", ""),
    brand: str(raw.brand, "brand", "Unbranded") || "Unbranded",
    category,
    tags: Array.from(new Set(strings(raw.tags).map(normaliseTag).filter(Boolean))),
    price: toMoney(price),
    salePrice: toMoney(price * (1 - discountPercent / 100)),
    discountPercent: Math.round(discountPercent * 10) / 10,
    rating: Math.min(Math.max(num(raw.rating, "rating", 0), 0), 5),
    reviewCount: reviews.length,
    reviews,
    stock,
    stockStatus: stockStatusFor(stock),
    minimumOrder: Math.max(num(raw.minimumOrderQuantity, "minimumOrderQuantity", 1), 1),
    weightKg: num(raw.weight, "weight", 0),
    dimensionsCm: {
      width: num(dimensions.width, "dimensions.width", 0),
      height: num(dimensions.height, "dimensions.height", 0),
      depth: num(dimensions.depth, "dimensions.depth", 0),
    },
    warranty: str(raw.warrantyInformation, "warrantyInformation", "No warranty"),
    shipping: str(raw.shippingInformation, "shippingInformation", ""),
    thumbnail: str(raw.thumbnail, "thumbnail", images[0] ?? ""),
    images,
    createdAt,
    updatedAt: date(isRecord(raw.meta) ? raw.meta.updatedAt : undefined, createdAt),
    source: "catalog",
  };
}

export const parseProducts = mapFeed<RawProduct, Product>(parseProduct);

/** Parses one page of the /products response envelope. */
export function parseProductPage(payload: unknown): ParseResult<Product> & { total: number } {
  if (!isRecord(payload) || !Array.isArray(payload.products)) {
    throw new ParseError("response is missing a products array");
  }
  const page = payload as unknown as RawProductPage;
  return { ...parseProducts(page.products), total: num(page.total, "total", page.products.length) };
}

/** Derives the category list (with counts) from parsed products. */
export function deriveCategories(products: readonly Product[]): Category[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  return Array.from(counts, ([slug, count]) => ({ slug, label: slugToLabel(slug), count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

/** Tag frequency, most common first. */
export function deriveTags(products: readonly Product[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const tag of product.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
}
