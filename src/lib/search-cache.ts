type Entry = { ids: string[]; at: number };

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type CacheHit = { ids: string[]; at: number };

export function normaliseQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Remembers search results (as product ids) per query in localStorage, so
 * repeating a search is instant and survives reloads. Entries expire after
 * `ttlMs`, and only the `maxEntries` most recent queries are kept.
 */
export function createSearchCache({
  storage,
  key = "stockroom:search:v1",
  ttlMs = 10 * 60 * 1000,
  maxEntries = 30,
  now = () => Date.now(),
}: {
  storage?: StorageLike | null;
  key?: string;
  ttlMs?: number;
  maxEntries?: number;
  now?: () => number;
} = {}) {
  let memory: Record<string, Entry> = {};

  function read(): Record<string, Entry> {
    if (!storage) return memory;
    try {
      const raw = storage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, Entry>) : {};
    } catch {
      return memory;
    }
  }

  function write(entries: Record<string, Entry>) {
    memory = entries;
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify(entries));
    } catch {
      // Storage full or blocked (private mode): the in-memory copy still works.
    }
  }

  return {
    get(query: string): CacheHit | null {
      const q = normaliseQuery(query);
      const entries = read();
      const entry = entries[q];
      if (!entry) return null;
      if (now() - entry.at > ttlMs) {
        delete entries[q];
        write(entries);
        return null;
      }
      return entry;
    },

    set(query: string, ids: string[]) {
      const q = normaliseQuery(query);
      const entries = read();
      entries[q] = { ids, at: now() };
      const newestFirst = Object.entries(entries).sort(([, a], [, b]) => b.at - a.at);
      write(Object.fromEntries(newestFirst.slice(0, maxEntries)));
    },

    size() {
      return Object.keys(read()).length;
    },

    clear() {
      memory = {};
      try {
        storage?.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}

export type SearchCache = ReturnType<typeof createSearchCache>;
