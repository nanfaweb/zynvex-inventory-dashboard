import assert from "node:assert/strict";
import { describe, it } from "node:test";
import page from "./__fixtures__/products-page.json" with { type: "json" };
import {
  deriveCategories,
  deriveTags,
  mapFeed,
  parseProduct,
  parseProductPage,
  slugToLabel,
  stockStatusFor,
} from "./parse";
import type { RawProduct } from "./types";

const sample = page.products[0] as RawProduct;

describe("parseProduct", () => {
  it("maps the raw feed into the domain model", () => {
    const product = parseProduct(sample);
    assert.equal(product.id, `catalog-${sample.id}`);
    assert.equal(product.price.cents, Math.round(sample.price * 100));
    assert.ok(product.salePrice.cents <= product.price.cents);
    assert.equal(product.reviewCount, sample.reviews.length);
    assert.ok(product.createdAt instanceof Date);
    assert.equal(product.source, "catalog");
  });

  it("normalises tags and fills missing optional fields", () => {
    const product = parseProduct({
      ...sample,
      brand: undefined,
      tags: ["Home Decor", "home decor", " Lamps "],
      reviews: undefined as unknown as RawProduct["reviews"],
    });
    assert.equal(product.brand, "Unbranded");
    assert.deepEqual(product.tags, ["home-decor", "lamps"]);
    assert.deepEqual(product.reviews, []);
  });

  it("coerces numeric strings and clamps out-of-range values", () => {
    const product = parseProduct({
      ...sample,
      price: "20" as unknown as number,
      discountPercentage: 150,
      rating: 9,
      stock: -4,
    });
    assert.equal(product.price.cents, 2000);
    assert.equal(product.discountPercent, 100);
    assert.equal(product.rating, 5);
    assert.equal(product.stock, 0);
    assert.equal(product.stockStatus, "out-of-stock");
  });

  it("rejects rows without required fields", () => {
    assert.throws(() => parseProduct({ ...sample, title: 42 as unknown as string }), /title/);
    assert.throws(() => parseProduct({ ...sample, price: -1 }), /negative/);
  });
});

describe("mapFeed", () => {
  it("collects bad rows as issues instead of failing the feed", () => {
    const double = mapFeed<number, number>((n) => {
      if (typeof n !== "number") throw new Error("not a number");
      return n * 2;
    });
    const result = double([1, "x", 3]);
    assert.deepEqual(result.items, [2, 6]);
    assert.deepEqual(result.issues, [{ index: 1, id: undefined, reason: "not a number" }]);
  });
});

describe("parseProductPage", () => {
  it("parses the response envelope", () => {
    const result = parseProductPage(page);
    assert.equal(result.items.length, page.products.length);
    assert.equal(result.total, page.total);
    assert.equal(result.issues.length, 0);
  });

  it("throws on a malformed envelope", () => {
    assert.throws(() => parseProductPage({ items: [] }), /products array/);
  });
});

describe("derived data", () => {
  const products = parseProductPage(page).items;

  it("builds categories with counts", () => {
    const categories = deriveCategories(products);
    assert.equal(categories.reduce((sum, c) => sum + c.count, 0), products.length);
    assert.equal(categories[0].label, slugToLabel(categories[0].slug));
  });

  it("counts tags", () => {
    assert.equal(deriveTags(products).every((t) => t.count > 0), true);
  });

  it("labels stock levels", () => {
    assert.equal(stockStatusFor(0), "out-of-stock");
    assert.equal(stockStatusFor(5), "low-stock");
    assert.equal(stockStatusFor(50), "in-stock");
  });

  it("turns slugs into labels", () => {
    assert.equal(slugToLabel("mens-shoes"), "Mens Shoes");
  });
});
