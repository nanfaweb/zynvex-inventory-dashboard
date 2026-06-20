import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSearchCache, normaliseQuery } from "./search-cache";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("search cache", () => {
  it("normalises queries so equivalent searches share an entry", () => {
    assert.equal(normaliseQuery("  Phone   CASE "), "phone case");
    const cache = createSearchCache({ storage: memoryStorage() });
    cache.set("Phone case", ["a"]);
    assert.deepEqual(cache.get("  phone   case")?.ids, ["a"]);
  });

  it("expires entries after the ttl", () => {
    let t = 0;
    const cache = createSearchCache({ storage: memoryStorage(), ttlMs: 100, now: () => t });
    cache.set("lamp", ["1"]);
    t = 50;
    assert.ok(cache.get("lamp"));
    t = 151;
    assert.equal(cache.get("lamp"), null);
    assert.equal(cache.size(), 0);
  });

  it("keeps only the newest entries", () => {
    let t = 0;
    const cache = createSearchCache({ storage: memoryStorage(), maxEntries: 2, now: () => ++t });
    cache.set("a", []);
    cache.set("b", []);
    cache.set("c", []);
    assert.equal(cache.get("a"), null);
    assert.ok(cache.get("c"));
  });

  it("falls back to memory when storage throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {},
    };
    const cache = createSearchCache({ storage: broken });
    cache.set("desk", ["9"]);
    assert.deepEqual(cache.get("desk")?.ids, ["9"]);
  });
});
