import { describe, it, expect, vi, beforeEach } from "vitest";

const { get, post, del, patch } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/lib/http", () => ({
  default: { get, post, delete: del, patch },
  clearHttpCache: vi.fn(),
}));
vi.mock("@/lib/idempotency", () => ({ withIdempotency: (c = {}) => c }));

import { getCollections, createCollection, detachBookFromCollection } from "@/services/collections";
import { API_ENDPOINTS } from "@/config";

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  del.mockReset();
  patch.mockReset();
});

describe("collections service", () => {
  it("getCollections normalizes the paginated envelope + drops empty params", async () => {
    get.mockResolvedValue({
      data: { result: { count: 2, results: [{ id: 1 }, { id: 2 }] }, success: true },
    });
    const out = await getCollections({ is_active: true, q: "", shop: 5 });
    expect(get).toHaveBeenCalledWith(
      API_ENDPOINTS.COLLECTIONS.LIST,
      expect.objectContaining({ params: { is_active: true, shop: 5 } }),
    );
    expect(out.collections).toHaveLength(2);
    expect(out.count).toBe(2);
  });

  it("createCollection posts book_ids + bundle_price and unwraps the result", async () => {
    post.mockResolvedValue({ data: { result: { id: 9, title: "A, B" }, success: true } });
    const out = await createCollection({ book_ids: [1, 2], bundle_price: "300" });
    const [url, body] = post.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.COLLECTIONS.CREATE);
    expect(body).toEqual({ book_ids: [1, 2], bundle_price: "300" });
    expect(out.collection.id).toBe(9);
  });

  it("detach hits the per-book DELETE route", async () => {
    del.mockResolvedValue({ data: { result: { id: 9 }, success: true } });
    await detachBookFromCollection(9, 4);
    expect(del).toHaveBeenCalledWith(`${API_ENDPOINTS.COLLECTIONS.BOOK}/9/books/4/`);
  });
});
