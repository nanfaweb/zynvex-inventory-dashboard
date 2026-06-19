import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import page from "./__fixtures__/products-page.json" with { type: "json" };
import { ApiError, fetchCatalog, withRetry } from "./api";

function respond(body: unknown, init: ResponseInit = { status: 200 }) {
  return mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(body), init));
}

afterEach(() => mock.restoreAll());

describe("fetchCatalog", () => {
  it("returns parsed products", async () => {
    respond(page);
    const result = await fetchCatalog();
    assert.equal(result.products.length, page.products.length);
    assert.equal(result.products[0].source, "catalog");
  });

  it("raises a typed http error", async () => {
    respond({ message: "nope" }, { status: 503, statusText: "Service Unavailable" });
    await assert.rejects(fetchCatalog(), (error: ApiError) => error.kind === "http" && error.status === 503 && error.retryable);
  });

  it("raises a parse error for an unexpected envelope", async () => {
    respond({ items: [] });
    await assert.rejects(fetchCatalog(), (error: ApiError) => error.kind === "parse" && !error.retryable);
  });

  it("raises a network error when fetch fails", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("fetch failed");
    });
    await assert.rejects(fetchCatalog(), (error: ApiError) => error.kind === "network");
  });
});

describe("withRetry", () => {
  it("retries retryable errors and then succeeds", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new ApiError("network", "flaky");
        return "ok";
      },
      { baseDelayMs: 1 },
    );
    assert.equal(result, "ok");
    assert.equal(calls, 3);
  });

  it("does not retry non-retryable errors", async () => {
    let calls = 0;
    await assert.rejects(
      withRetry(async () => {
        calls++;
        throw new ApiError("parse", "bad");
      }),
    );
    assert.equal(calls, 1);
  });
});
