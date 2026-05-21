/**
 * HTTP response cache for src/lib/http.js.
 *
 * Why a separate module?
 *   - http.js was 300+ lines mixing axios setup, refresh queue, resilience,
 *     AND cache. Splitting cache out lets us unit-test it in isolation
 *     (tests/unit/httpCache.test.js) without spinning up axios.
 *   - The behaviour is non-trivial (LRU, persistence, SWR, in-flight
 *     dedup, prefix invalidation); concentrating it in one file makes
 *     bugs visible.
 *
 * Public surface:
 *   - lookup(key, ttl): { hit, stale, data } — hit=true returns cached
 *     payload; stale=true means caller should kick off a background refresh
 *     and still return cached data immediately (SWR contract).
 *   - store(key, data): write, persist (when eligible), evict LRU overflow.
 *   - invalidate(prefix): drop entries whose key includes `prefix`. Pass
 *     no arg to flush everything.
 *   - dedup(key, factory): if another request for `key` is in flight,
 *     return its promise; otherwise call factory() and remember it.
 *
 * All callers pass *fully-built* cache keys (built in http.js from
 * url+params+locale+token). This module doesn't know about URLs, locales,
 * or tokens — those are http.js concerns.
 */

const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";

// Hard cap on entries — bounds memory in long single-page sessions. The
// Map preserves insertion order, so we get LRU semantics for free by
// re-inserting on hit and deleting the oldest on overflow.
const MAX_ENTRIES = 200;

// localStorage prefix — namespaced so we don't collide with anything else
// the app writes there (auth tokens, theme, etc.).
const LS_PREFIX = "kz:httpCache:";

// In-memory store. Value shape: { data, timestamp, persisted, etag? }
const cache = new Map();

// Outstanding fetches — keyed identically to cache. dedup() returns the
// same promise for parallel callers so we never hit the network twice
// for the same URL+params+locale+token in flight at once.
const pending = new Map();

// SWR background-refresh tracker — endpoints currently being revalidated
// behind a stale hit. Prevents stampedes from rapid-fire stale reads
// triggering multiple concurrent refresh fetches.
const inflightSWR = new Set();

// Hook for http.js to register: when we mark a key stale, run this fn
// against the *next* request to that key, even if the user hasn't acted.
// We don't background-fetch on our own (we don't know the axios config);
// instead http.js asks us on its next call.
//
// Implementation choice: we just *expire* the entry. Next call sees miss
// and fetches normally.

let lsAvailable = null;

/** Defer the storage probe until first use — SSR safety. */
function checkLocalStorage() {
  if (lsAvailable !== null) return lsAvailable;
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      lsAvailable = false;
      return false;
    }
    const probe = `${LS_PREFIX}__probe__`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    lsAvailable = true;
  } catch {
    lsAvailable = false;
  }
  return lsAvailable;
}

/**
 * Should this cache key spill over to localStorage so it survives
 * page reloads? Reserved for stable admin-curated content where one
 * extra render of slightly-stale data is preferable to a blocking
 * cold-load fetch. Keep this list short — every persisted key takes a
 * localStorage slot.
 */
const PERSISTENT_PATTERNS = ["/regions", "/faqs", "/policies", "/categories"];

function isPersistentKey(key) {
  return PERSISTENT_PATTERNS.some((segment) => key.includes(segment));
}

/**
 * Endpoints where stale-while-revalidate makes sense: list views where
 * an instant render is more important than millisecond-fresh data. The
 * background refetch keeps things current without blocking the UI.
 * Detail pages (book/<id>, shop/<id>) are intentionally NOT in this set —
 * users opening a detail expect the latest price/availability.
 */
const SWR_PATTERNS = [
  "/regions",
  "/faqs",
  "/policies",
  "/categories",
  "/banners",
  "/book/list",
  "/shop/list",
  "/stories",
];

function isSWREligible(key) {
  return SWR_PATTERNS.some((segment) => key.includes(segment));
}

/** Pull a persisted entry back into the in-memory map at boot. */
function rehydrateFromStorage() {
  if (!checkLocalStorage()) return;
  try {
    const now = Date.now();
    const ls = window.localStorage;
    const toDrop = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (!k || !k.startsWith(LS_PREFIX)) continue;
      try {
        const raw = ls.getItem(k);
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          toDrop.push(k);
          continue;
        }
        const { data, timestamp, ttl } = parsed;
        if (typeof timestamp !== "number" || typeof ttl !== "number") {
          toDrop.push(k);
          continue;
        }
        // Anything we wrote >7 days ago is junk — drop it regardless of
        // its declared TTL. Real long-TTL entries are 24h max.
        if (now - timestamp > 7 * 24 * 60 * 60 * 1000) {
          toDrop.push(k);
          continue;
        }
        const cacheKey = k.slice(LS_PREFIX.length);
        cache.set(cacheKey, { data, timestamp, persisted: true });
      } catch {
        toDrop.push(k);
      }
    }
    for (const k of toDrop) {
      try {
        ls.removeItem(k);
      } catch {
        /* quota / blocked — ignore */
      }
    }
    if (isDev && cache.size > 0) {
      // eslint-disable-next-line no-console
      console.log(`📦 cache rehydrated: ${cache.size} entries from localStorage`);
    }
  } catch {
    /* Storage probe failed — run uncached */
  }
}

// Auto-rehydrate when the module is loaded in the browser. Server-side
// imports skip this branch (checkLocalStorage returns false).
if (typeof window !== "undefined") {
  rehydrateFromStorage();

  // Visibility-change handler — when the user returns to a tab they've
  // hidden for more than HIDE_THRESHOLD_MS, expire SWR-eligible entries
  // so the next access refetches. Detail pages and user-scoped data
  // (which are not SWR-eligible) keep their own TTL/no-cache rules.
  const HIDE_THRESHOLD_MS = 5 * 60 * 1000;
  let hiddenAt = null;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    if (!hiddenAt) return;
    const wasHiddenFor = Date.now() - hiddenAt;
    hiddenAt = null;
    if (wasHiddenFor < HIDE_THRESHOLD_MS) return;
    let expired = 0;
    for (const [key, entry] of cache.entries()) {
      if (isSWREligible(key)) {
        // Don't delete — keep stale data for instant render. Just zero
        // the timestamp so the next lookup treats it as past-TTL.
        cache.set(key, { ...entry, timestamp: 0 });
        expired += 1;
      }
    }
    if (isDev && expired > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `📦 cache: ${expired} SWR entries marked stale after ${Math.round(wasHiddenFor / 1000)}s background`,
      );
    }
  });
}

/**
 * Read an entry. Returns:
 *   { hit: false }                          — no entry exists
 *   { hit: true, stale: false, data }       — fresh, return as-is
 *   { hit: true, stale: true, data, swr }   — past TTL; swr=true means
 *     the caller should serve `data` immediately AND fire a background
 *     refetch. swr=false means treat as miss.
 */
export function lookup(key, ttl) {
  if (ttl === 0) return { hit: false };
  const entry = cache.get(key);
  if (!entry) return { hit: false };

  const age = Date.now() - entry.timestamp;
  if (age <= ttl) {
    // LRU touch — re-insert to move to end of Map's insertion order.
    cache.delete(key);
    cache.set(key, entry);
    return { hit: true, stale: false, data: entry.data };
  }

  if (isSWREligible(key)) {
    // SWR: serve stale, signal caller to refresh in background.
    return { hit: true, stale: true, data: entry.data, swr: true };
  }

  // Past TTL and not SWR-eligible → treat as miss so caller refetches.
  cache.delete(key);
  removeFromStorage(key);
  return { hit: false };
}

/** Write an entry; persist if eligible; evict LRU overflow. */
export function store(key, data) {
  const entry = { data, timestamp: Date.now() };
  if (cache.has(key)) cache.delete(key); // re-insert at end for LRU
  cache.set(key, entry);

  if (cache.size > MAX_ENTRIES) {
    // Drop the oldest 10% in one shot — avoids churning on every write.
    const overflow = cache.size - MAX_ENTRIES;
    const dropCount = Math.max(overflow, Math.ceil(MAX_ENTRIES * 0.1));
    const iter = cache.keys();
    for (let i = 0; i < dropCount; i++) {
      const k = iter.next().value;
      if (!k) break;
      cache.delete(k);
      removeFromStorage(k);
    }
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`📦 cache evicted ${dropCount} LRU entries`);
    }
  }

  if (isPersistentKey(key) && checkLocalStorage()) {
    try {
      // Compute the longest TTL this segment might use so rehydration
      // can self-expire entries we don't recognise after deploys.
      window.localStorage.setItem(
        `${LS_PREFIX}${key}`,
        JSON.stringify({
          data,
          timestamp: entry.timestamp,
          ttl: 24 * 60 * 60 * 1000,
        }),
      );
    } catch {
      // Quota exceeded or storage disabled — log once in dev, run on.
      if (isDev) {
        // eslint-disable-next-line no-console
        console.warn("📦 cache: localStorage write failed for", key);
      }
    }
  }
}

function removeFromStorage(key) {
  if (!checkLocalStorage()) return;
  try {
    window.localStorage.removeItem(`${LS_PREFIX}${key}`);
  } catch {
    /* ignore */
  }
}

/**
 * Drop cached entries.
 *   invalidate()           — clears everything (both in-memory + persisted)
 *   invalidate("/books/")  — clears only keys whose URL includes that
 *                            substring. Use after a mutation so the next
 *                            list fetch picks up the new row.
 */
export function invalidate(prefix) {
  if (!prefix) {
    cache.clear();
    pending.clear();
    inflightSWR.clear();
    if (checkLocalStorage()) {
      try {
        const toDrop = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(LS_PREFIX)) toDrop.push(k);
        }
        for (const k of toDrop) window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
    return;
  }
  let dropped = 0;
  for (const key of [...cache.keys()]) {
    if (key.includes(prefix)) {
      cache.delete(key);
      removeFromStorage(key);
      dropped += 1;
    }
  }
  // Also clear pending entries — a fetch started against now-stale data
  // shouldn't poison the cache when it resolves.
  for (const key of [...pending.keys()]) {
    if (key.includes(prefix)) pending.delete(key);
  }
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`📦 cache invalidated ${dropped} entries matching "${prefix}"`);
  }
}

/**
 * Register an in-flight request promise so parallel callers can dedupe
 * to a single network round trip. Caller owns the promise lifecycle;
 * we just stash + return it.
 */
export function rememberPending(key, promise) {
  pending.set(key, promise);
  // Auto-cleanup so a long-aborted promise doesn't leak.
  promise
    .catch(() => {})
    .finally(() => {
      if (pending.get(key) === promise) pending.delete(key);
    });
}

export function getPending(key) {
  return pending.get(key);
}

/**
 * SWR background-refresh guard. http.js calls this when it serves a stale
 * entry; if no other refresh is running for the same key, the caller
 * fires a background fetch. Returns false if a refresh is already in
 * flight (caller should skip).
 */
export function tryStartSWRRefresh(key) {
  if (inflightSWR.has(key)) return false;
  inflightSWR.add(key);
  return true;
}

export function finishSWRRefresh(key) {
  inflightSWR.delete(key);
}

/** Test/diagnostic helper — never call from product code. */
export function _debugSnapshot() {
  return {
    size: cache.size,
    pending: pending.size,
    inflightSWR: inflightSWR.size,
    keys: [...cache.keys()],
  };
}

/** Test-only reset so each unit test starts from a clean slate. */
export function _resetForTests() {
  cache.clear();
  pending.clear();
  inflightSWR.clear();
  if (checkLocalStorage()) {
    try {
      const toDrop = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) toDrop.push(k);
      }
      for (const k of toDrop) window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
}
