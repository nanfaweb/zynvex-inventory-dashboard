import assert from "node:assert/strict";
import { describe, it } from "node:test";
import page from "./__fixtures__/products-page.json" with { type: "json" };
import { activeFilterCount, applyFilters, defaultFilters } from "./filter";
import { parseProductPage } from "./parse";

const products = parseProductPage(page).items;

describe("applyFilters", () => {
  it("returns everything with default filters", () => {
    assert.equal(applyFilters(products, defaultFilters).length, products.length);
  });

  it("filters by category", () => {
    const category = products[0].category;
    const result = applyFilters(products, { ...defaultFilters, category });
    assert.ok(result.length > 0);
    assert.ok(result.every((p) => p.category === category));
  });

  it("requires every selected tag", () => {
    const tags = products[0].tags.slice(0, 2);
    const result = applyFilters(products, { ...defaultFilters, tags });
    assert.ok(result.every((p) => tags.every((t) => p.tags.includes(t))));
  });

  it("sorts by price without mutating the input", () => {
    const before = products.map((p) => p.id);
    const result = applyFilters(products, { ...defaultFilters, sort: "price-asc" });
    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i - 1].salePrice.cents <= result[i].salePrice.cents);
    }
    assert.deepEqual(products.map((p) => p.id), before);
  });

  it("counts active filters", () => {
    assert.equal(activeFilterCount(defaultFilters), 0);
    assert.equal(activeFilterCount({ ...defaultFilters, category: "x", tags: ["a", "b"], stock: "low-stock" }), 4);
  });
});
