import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withRetry,
  circuit,
  resetCircuit,
  CircuitOpenError,
  isServerErrorStatus,
  isNetworkError,
} from "@/lib/httpResilience";

beforeEach(() => {
  resetCircuit();
});

describe("isServerErrorStatus", () => {
  it("returns true for 500-599", () => {
    expect(isServerErrorStatus(500)).toBe(true);
    expect(isServerErrorStatus(503)).toBe(true);
    expect(isServerErrorStatus(599)).toBe(true);
  });
  it("returns false for 4xx and 2xx", () => {
    expect(isServerErrorStatus(404)).toBe(false);
    expect(isServerErrorStatus(200)).toBe(false);
    expect(isServerErrorStatus(null)).toBe(false);
  });
});

describe("isNetworkError", () => {
  it("returns true when no response and ERR_NETWORK", () => {
    expect(isNetworkError({ code: "ERR_NETWORK" })).toBe(true);
    expect(isNetworkError({ code: "ECONNABORTED" })).toBe(true);
  });
  it("returns false when response present", () => {
    expect(isNetworkError({ response: { status: 500 } })).toBe(false);
  });
});

describe("CircuitBreaker", () => {
  it("starts closed", () => {
    expect(circuit.canPass()).toBe(true);
    expect(circuit.snapshot().state).toBe("closed");
  });

  it("opens after threshold consecutive server errors", () => {
    for (let i = 0; i < 5; i += 1) {
      circuit.recordFailure(true);
    }
    expect(circuit.snapshot().state).toBe("open");
    expect(circuit.canPass()).toBe(false);
  });

  it("ignores non-server failures (4xx)", () => {
    for (let i = 0; i < 10; i += 1) {
      circuit.recordFailure(false);
    }
    expect(circuit.snapshot().state).toBe("closed");
  });

  it("recordSuccess resets failures to 0", () => {
    circuit.recordFailure(true);
    circuit.recordFailure(true);
    circuit.recordSuccess();
    expect(circuit.snapshot().failures).toBe(0);
  });

  it("CircuitOpenError carries a snapshot", () => {
    for (let i = 0; i < 5; i += 1) {
      circuit.recordFailure(true);
    }
    const err = new CircuitOpenError(circuit.snapshot());
    expect(err.name).toBe("CircuitOpenError");
    expect(err.code).toBe("ECIRCUIT_OPEN");
    expect(err.snapshot.state).toBe("open");
  });
});

describe("withRetry", () => {
  it("returns immediately on success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn, { retries: 3, baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on 5xx and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValue("recovered");
    const result = await withRetry(fn, { retries: 3, baseDelayMs: 1 });
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry on 4xx", async () => {
    const fn = vi.fn().mockRejectedValue({ response: { status: 400 } });
    await expect(withRetry(fn, { retries: 3, baseDelayMs: 1 })).rejects.toMatchObject({
      response: { status: 400 },
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on network errors", async () => {
    const fn = vi.fn().mockRejectedValueOnce({ code: "ERR_NETWORK" }).mockResolvedValue("ok");
    const result = await withRetry(fn, { retries: 2, baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("gives up after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue({ response: { status: 500 } });
    await expect(withRetry(fn, { retries: 2, baseDelayMs: 1 })).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(fn).toHaveBeenCalledTimes(3); // attempt 1 + 2 retries
  });
});
