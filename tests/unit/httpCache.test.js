import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  lookup,
  store,
  invalidate,
  rememberPending,
  getPending,
  tryStartSWRRefresh,
  finishSWRRefresh,
  _debugSnapshot,
  _resetForTests,
} from "@/lib/httpCache";

const FRESH_TTL = 60_000;
const STALE_TTL = 1; // anything written > 1ms ago is past TTL

describe("httpCache", () => {
  beforeEach(() => {
    _resetForTests();
  });

  afterEach(() => {
    _resetForTests();
    vi.useRealTimers();
  });

  describe("lookup / store", () => {
    it("returns miss for an unknown key", () => {
      expect(lookup("nope", FRESH_TTL)).toEqual({ hit: false });
    });

    it("returns the stored payload while fresh", () => {
      store("/regions/?::uz::anon", { regions: [{ id: 1 }] });
      const r = lookup("/regions/?::uz::anon", FRESH_TTL);
      expect(r).toMatchObject({ hit: true, stale: false });
      expect(r.data).toEqual({ regions: [{ id: 1 }] });
    });

    it("ttl=0 short-circuits and never returns a hit", () => {
      store("/auth/me/?::uz::abc", { user: { id: 1 } });
      expect(lookup("/auth/me/?::uz::abc", 0)).toEqual({ hit: false });
    });

    it("evicts past-TTL non-SWR entries on lookup (book detail-style)", async () => {
      store("/book/42/?::uz::anon", { book: { id: 42 } });
      // wait a tick so the entry is past STALE_TTL=1ms
      await new Promise((r) => setTimeout(r, 5));
      const result = lookup("/book/42/?::uz::anon", STALE_TTL);
      expect(result.hit).toBe(false);
      // entry should be removed
      expect(_debugSnapshot().keys).not.toContain("/book/42/?::uz::anon");
    });

    it("returns stale data for SWR-eligible past-TTL entries", async () => {
      const key = "/book/list/?type=sell::uz::anon";
      store(key, { books: [{ id: 1 }] });
      await new Promise((r) => setTimeout(r, 5));
      const result = lookup(key, STALE_TTL);
      expect(result.hit).toBe(true);
      expect(result.stale).toBe(true);
      expect(result.swr).toBe(true);
      expect(result.data).toEqual({ books: [{ id: 1 }] });
    });
  });

  describe("invalidate", () => {
    it("clears every entry when called with no prefix", () => {
      store("/regions/?::uz::anon", { a: 1 });
      store("/categories/?::uz::anon", { b: 2 });
      invalidate();
      expect(lookup("/regions/?::uz::anon", FRESH_TTL).hit).toBe(false);
      expect(lookup("/categories/?::uz::anon", FRESH_TTL).hit).toBe(false);
    });

    it("scoped invalidate only drops matching keys (the prefix-arg bug fix)", () => {
      store("/regions/?::uz::anon", { regions: [] });
      store("/book/list/?type=sell::uz::anon", { books: [] });
      store("/book/12/?::uz::anon", { book: { id: 12 } });

      invalidate("/book/");

      // Regions survive — this was the bug: clearHttpCache used to flush
      // everything on every mutation.
      expect(lookup("/regions/?::uz::anon", FRESH_TTL).hit).toBe(true);
      // Both /book/ entries are gone.
      expect(lookup("/book/list/?type=sell::uz::anon", FRESH_TTL).hit).toBe(false);
      expect(lookup("/book/12/?::uz::anon", FRESH_TTL).hit).toBe(false);
    });

    it("removes pending requests that match the prefix", () => {
      const p = Promise.resolve("done");
      rememberPending("/book/list/?::uz::anon", p);
      expect(getPending("/book/list/?::uz::anon")).toBe(p);
      invalidate("/book/");
      expect(getPending("/book/list/?::uz::anon")).toBeUndefined();
    });
  });

  describe("LRU eviction", () => {
    it("bounds the cache at 200 entries and drops oldest in batches", () => {
      // Write 220 distinct entries → triggers the 10% LRU sweep
      for (let i = 0; i < 220; i++) {
        store(`/book/${i}/?::uz::anon`, { id: i });
      }
      const snap = _debugSnapshot();
      // After eviction we should be at or below MAX_ENTRIES (200).
      // The sweep drops at least overflow (20) or 10% (20) — whichever
      // is larger — in one pass; final size is in [180, 200].
      expect(snap.size).toBeGreaterThanOrEqual(180);
      expect(snap.size).toBeLessThanOrEqual(200);
      // The oldest entry (id=0) should have been evicted.
      expect(snap.keys).not.toContain("/book/0/?::uz::anon");
      // The newest one should remain.
      expect(snap.keys).toContain("/book/219/?::uz::anon");
    });

    it("touches LRU position on hit so frequently-read entries survive eviction", () => {
      // Fill cache to MAX (200 entries) without triggering eviction.
      for (let i = 0; i < 200; i++) {
        store(`/entry/${i}/?::uz::anon`, { i });
      }
      // Touch the oldest entry — re-inserts it to the end of insertion
      // order, so the next eviction sweep won't catch it.
      lookup("/entry/0/?::uz::anon", FRESH_TTL);
      // Now overflow by 1 → triggers a 10% LRU sweep that drops the
      // oldest entries (entry/1..20). entry/0 was just touched so it
      // sits at the end alongside the new entry.
      store("/entry/200/?::uz::anon", { i: 200 });

      const snap = _debugSnapshot();
      // The touched entry survives the sweep.
      expect(snap.keys).toContain("/entry/0/?::uz::anon");
      // Sibling entries that weren't touched get evicted (these were
      // the oldest at sweep time).
      expect(snap.keys).not.toContain("/entry/1/?::uz::anon");
      expect(snap.keys).not.toContain("/entry/10/?::uz::anon");
      // The freshly written entry is also kept.
      expect(snap.keys).toContain("/entry/200/?::uz::anon");
    });
  });

  describe("SWR refresh stampede guard", () => {
    it("first call wins, parallel callers skip", () => {
      const key = "/book/list/?::uz::anon";
      expect(tryStartSWRRefresh(key)).toBe(true);
      expect(tryStartSWRRefresh(key)).toBe(false);
      expect(tryStartSWRRefresh(key)).toBe(false);
      finishSWRRefresh(key);
      expect(tryStartSWRRefresh(key)).toBe(true);
    });
  });

  describe("pending request dedup", () => {
    it("returns the same promise to parallel callers", async () => {
      const p = new Promise((resolve) => setTimeout(() => resolve("ok"), 5));
      rememberPending("/regions/?::uz::anon", p);
      expect(getPending("/regions/?::uz::anon")).toBe(p);
      await p;
      // After settle the entry is cleaned up by the .finally hook.
      await new Promise((r) => setTimeout(r, 5));
      expect(getPending("/regions/?::uz::anon")).toBeUndefined();
    });
  });

  describe("localStorage persistence", () => {
    it("writes through persistent-pattern entries", () => {
      store("/regions/?::uz::anon", { regions: [{ id: 1 }] });
      const stored = Object.keys(window.localStorage).filter((k) => k.startsWith("kz:httpCache:"));
      expect(stored.length).toBeGreaterThan(0);
      expect(stored.some((k) => k.includes("/regions/"))).toBe(true);
    });

    it("does not persist non-whitelisted entries", () => {
      store("/book/list/?type=sell::uz::anon", { books: [] });
      const stored = Object.keys(window.localStorage).filter((k) => k.startsWith("kz:httpCache:"));
      // Books are NOT in PERSISTENT_PATTERNS — should stay in-memory only.
      expect(stored.every((k) => !k.includes("/book/list/"))).toBe(true);
    });

    it("invalidate(prefix) removes matching persisted entries too", () => {
      store("/regions/?::uz::anon", { regions: [] });
      store("/categories/?::uz::anon", { cats: [] });
      invalidate("/regions");
      const stored = Object.keys(window.localStorage).filter((k) => k.startsWith("kz:httpCache:"));
      expect(stored.every((k) => !k.includes("/regions"))).toBe(true);
      expect(stored.some((k) => k.includes("/categories"))).toBe(true);
    });
  });
});
