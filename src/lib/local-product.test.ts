import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productFromForm } from "./local-product";
import { productFormSchema } from "./product-schema";

const values = productFormSchema.parse({
  title: "Walnut desk lamp",
  brand: "Lumen",
  category: "home-decoration",
  price: 80,
  discountPercent: 25,
  stock: 6,
  minimumOrder: 1,
  tags: ["lighting"],
  description: "",
  thumbnail: "",
});

describe("productFromForm", () => {
  it("builds a local product with derived fields", () => {
    const product = productFromForm(values, new Date("2026-06-18T10:00:00Z"), "abcdef12-3456");
    assert.equal(product.id, "local-abcdef12-3456");
    assert.equal(product.sku, "HOM-LUM-ABCDEF");
    assert.equal(product.salePrice.cents, 6000);
    assert.equal(product.stockStatus, "low-stock");
    assert.equal(product.source, "local");
  });
});

describe("productFormSchema", () => {
  it("rejects a minimum order larger than stock", () => {
    const result = productFormSchema.safeParse({ ...values, stock: 2, minimumOrder: 5 });
    assert.equal(result.success, false);
  });

  it("rejects duplicate tags", () => {
    const result = productFormSchema.safeParse({ ...values, tags: ["desk", "desk"] });
    assert.equal(result.success, false);
  });
});
