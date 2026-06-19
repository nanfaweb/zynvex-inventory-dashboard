import { ParseError, parseProductPage } from "./parse";
import type { ParseIssue, Product } from "./types";

export const API_BASE = "https://dummyjson.com";

export type ApiErrorKind = "network" | "timeout" | "http" | "parse" | "aborted";

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Worth retrying automatically? Bad payloads and 4xx responses won't fix themselves. */
  get retryable() {
    return this.kind === "network" || this.kind === "timeout" || (this.kind === "http" && (this.status ?? 0) >= 500);
  }
}

type RequestOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

/** fetch + JSON with a timeout, caller cancellation and typed failures. */
export async function getJson(path: string, { signal, timeoutMs = 10_000 }: RequestOptions = {}): Promise<unknown> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { signal: combined, headers: { Accept: "application/json" } });
  } catch (error) {
    if (signal?.aborted) throw new ApiError("aborted", "Request was cancelled");
    if (timeout.aborted) throw new ApiError("timeout", `The catalog took longer than ${timeoutMs / 1000}s to respond`);
    throw new ApiError("network", error instanceof Error ? error.message : "Network request failed");
  }

  if (!response.ok) {
    throw new ApiError("http", `Catalog responded with ${response.status} ${response.statusText}`.trim(), response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("parse", "Catalog sent a response that isn't valid JSON");
  }
}

export type CatalogPayload = { products: Product[]; issues: ParseIssue[]; total: number };

function parseOrThrow(payload: unknown): CatalogPayload {
  try {
    const { items, issues, total } = parseProductPage(payload);
    return { products: items, issues, total };
  } catch (error) {
    if (error instanceof ParseError) throw new ApiError("parse", error.message);
    throw error;
  }
}

/** Every product in the catalog (the API returns all rows when limit=0). */
export async function fetchCatalog(options?: RequestOptions): Promise<CatalogPayload> {
  return parseOrThrow(await getJson("/products?limit=0", options));
}

/** Full-text search on the server, used by the search bar. */
export async function searchCatalog(query: string, options?: RequestOptions): Promise<CatalogPayload> {
  return parseOrThrow(await getJson(`/products/search?q=${encodeURIComponent(query)}&limit=0`, options));
}

/** Retries retryable failures with exponential backoff (400ms, 800ms, ...). */
export async function withRetry<T>(
  task: () => Promise<T>,
  { attempts = 3, baseDelayMs = 400, onRetry }: { attempts?: number; baseDelayMs?: number; onRetry?: (attempt: number, error: ApiError) => void } = {},
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      const retryable = error instanceof ApiError && error.retryable;
      if (!retryable || attempt >= attempts) throw error;
      onRetry?.(attempt, error);
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)));
    }
  }
}
