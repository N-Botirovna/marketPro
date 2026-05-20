import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDraftStorage } from "@/hooks/useDraftStorage";

const KEY = "test-draft";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("useDraftStorage", () => {
  it("returns null draft when nothing is stored", () => {
    const { result } = renderHook(() => useDraftStorage(KEY, null));
    expect(result.current.draft).toBeNull();
    expect(result.current.hasDraft).toBe(false);
  });

  it("restores a fresh draft on mount", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ savedAt: Date.now(), payload: { name: "hello" } }),
    );
    const { result } = renderHook(() => useDraftStorage(KEY, null));
    expect(result.current.draft).toEqual({ name: "hello" });
    expect(result.current.hasDraft).toBe(true);
  });

  it("drops expired drafts", () => {
    const expired = Date.now() - 48 * 60 * 60 * 1000; // 48h ago
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ savedAt: expired, payload: { name: "old" } }),
    );
    const { result } = renderHook(() => useDraftStorage(KEY, null, { ttlMs: 24 * 60 * 60 * 1000 }));
    expect(result.current.draft).toBeNull();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("clear() removes the storage entry", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ savedAt: Date.now(), payload: { name: "x" } }),
    );
    const { result } = renderHook(() => useDraftStorage(KEY, null));
    expect(result.current.hasDraft).toBe(true);

    act(() => {
      result.current.clear();
    });
    expect(window.localStorage.getItem(KEY)).toBeNull();
    expect(result.current.hasDraft).toBe(false);
  });

  it("save() persists a snapshot synchronously, skipping File/Blob fields", () => {
    const { result } = renderHook(() => useDraftStorage(KEY, null));

    const file = new Blob(["x"], { type: "text/plain" });
    act(() => {
      result.current.save({ name: "hi", picture: file, count: 3 });
    });

    const stored = JSON.parse(window.localStorage.getItem(KEY));
    expect(stored.payload).toEqual({ name: "hi", count: 3 });
    expect(stored.savedAt).toBeTypeOf("number");
  });

  it("excludeKeys are dropped from saved snapshots", () => {
    const { result } = renderHook(() => useDraftStorage(KEY, null, { excludeKeys: ["secret"] }));
    act(() => {
      result.current.save({ name: "ok", secret: "shhh" });
    });
    const stored = JSON.parse(window.localStorage.getItem(KEY));
    expect(stored.payload).toEqual({ name: "ok" });
  });

  it("ignores corrupt JSON in storage", () => {
    window.localStorage.setItem(KEY, "{not json");
    const { result } = renderHook(() => useDraftStorage(KEY, null));
    expect(result.current.draft).toBeNull();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});
