/* ---------- Raw feed (as served by the DummyJSON /products API) ---------- */

export interface RawDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface RawReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface RawMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface RawProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: RawDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: RawReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: RawMeta;
  images: string[];
  thumbnail: string;
}

export interface RawProductPage {
  products: RawProduct[];
  total: number;
  skip: number;
  limit: number;
}

/* ---------- Domain model used by the UI ---------- */

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type ProductSource = "catalog" | "local";

export interface Money {
  /** Amount in cents, so totals never drift with float maths. */
  cents: number;
  currency: "USD";
}

export interface Review {
  rating: number;
  comment: string;
  author: string;
  date: Date;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  tags: string[];
  price: Money;
  /** Price after discount. */
  salePrice: Money;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  stock: number;
  stockStatus: StockStatus;
  minimumOrder: number;
  weightKg: number;
  dimensionsCm: { width: number; height: number; depth: number };
  warranty: string;
  shipping: string;
  thumbnail: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  source: ProductSource;
}

export interface Category {
  slug: string;
  label: string;
  count: number;
}

export interface ParseIssue {
  index: number;
  id: unknown;
  reason: string;
}

export interface ParseResult<T> {
  items: T[];
  issues: ParseIssue[];
}
