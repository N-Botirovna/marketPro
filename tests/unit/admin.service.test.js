import { describe, it, expect, vi, beforeEach } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/http", () => ({ default: { get } }));

import { fetchSummary, fetchFunnel, fetchDemand, fetchSupply } from "@/services/admin";
import { API_ENDPOINTS } from "@/config";

beforeEach(() => get.mockReset());

describe("admin service", () => {
  it("fetchSummary unwraps result and passes days", async () => {
    get.mockResolvedValue({ data: { result: { kpis: { total_users: 5 } }, success: true } });
    const out = await fetchSummary({ days: 7 });
    expect(get).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.SUMMARY,
      expect.objectContaining({ params: { days: 7 } }),
    );
    expect(out).toEqual({ kpis: { total_users: 5 } });
  });

  it("fetchDemand passes both days and limit", async () => {
    get.mockResolvedValue({ data: { result: { gaps: [] }, success: true } });
    await fetchDemand({ days: 30, limit: 10 });
    expect(get).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.DEMAND,
      expect.objectContaining({ params: { days: 30, limit: 10 } }),
    );
  });

  it("fetchFunnel returns raw data when there is no result wrapper", async () => {
    get.mockResolvedValue({ data: { foo: 1 } });
    expect(await fetchFunnel()).toEqual({ foo: 1 });
  });

  it("fetchSupply calls the supply endpoint", async () => {
    get.mockResolvedValue({ data: { result: {}, success: true } });
    await fetchSupply({ days: 90 });
    expect(get).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.SUPPLY,
      expect.objectContaining({ params: { days: 90 } }),
    );
  });

  it("omits empty params", async () => {
    get.mockResolvedValue({ data: { result: {}, success: true } });
    await fetchSummary();
    expect(get).toHaveBeenCalledWith(
      API_ENDPOINTS.ADMIN.SUMMARY,
      expect.objectContaining({ params: {} }),
    );
  });
});
