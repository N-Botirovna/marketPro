import { describe, it, expect, vi, beforeEach } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/http", () => ({ default: { get }, clearHttpCache: vi.fn() }));

import { getSellerBooks } from "@/services/books";
import { API_ENDPOINTS } from "@/config";

beforeEach(() => get.mockReset());

describe("getSellerBooks", () => {
  it("hits the seller-books action with a limit and unwraps seller/count/results", async () => {
    get.mockResolvedValue({
      data: {
        result: {
          seller: { kind: "shop", id: 7, name: "Kitob Shop" },
          count: 12,
          results: [{ id: 2 }, { id: 3 }],
        },
        success: true,
      },
    });

    const out = await getSellerBooks(9, 5);

    expect(get).toHaveBeenCalledWith(
      `${API_ENDPOINTS.BOOKS.DETAIL}/9/seller-books/`,
      expect.objectContaining({ params: { limit: 5 } }),
    );
    expect(out.seller).toEqual({ kind: "shop", id: 7, name: "Kitob Shop" });
    expect(out.count).toBe(12);
    expect(out.books).toHaveLength(2);
  });

  it("returns safe defaults when the payload is empty/malformed", async () => {
    get.mockResolvedValue({ data: { success: true } });
    const out = await getSellerBooks(1);
    expect(out).toEqual({ seller: null, count: 0, books: [] });
  });
});
