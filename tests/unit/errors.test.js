import { describe, it, expect } from "vitest";
import { mapApiError, ERROR_KINDS } from "@/lib/errors";

function fakeAxiosError({ status, data, message }) {
  return {
    name: "AxiosError",
    message: message || "Request failed",
    response: status === undefined ? undefined : { status, data },
    code: undefined,
  };
}

describe("mapApiError", () => {
  it("maps 401 to AUTH", () => {
    const result = mapApiError(fakeAxiosError({ status: 401, data: { result: "no token" } }));
    expect(result.kind).toBe(ERROR_KINDS.AUTH);
    expect(result.status).toBe(401);
    expect(result.message).toBe("no token");
  });

  it("maps 403 to PERMISSION", () => {
    const result = mapApiError(fakeAxiosError({ status: 403, data: { detail: "no perm" } }));
    expect(result.kind).toBe(ERROR_KINDS.PERMISSION);
    expect(result.message).toBe("no perm");
  });

  it("maps 404 to NOTFOUND", () => {
    const result = mapApiError(fakeAxiosError({ status: 404, data: {} }));
    expect(result.kind).toBe(ERROR_KINDS.NOTFOUND);
  });

  it("maps 400 with DRF envelope to VALIDATION with fieldErrors", () => {
    const result = mapApiError(
      fakeAxiosError({
        status: 400,
        data: { result: { name: ["Required"], price: ["Must be > 0"] }, success: false },
      }),
    );
    expect(result.kind).toBe(ERROR_KINDS.VALIDATION);
    expect(result.fieldErrors).toEqual({
      name: "Required",
      price: "Must be > 0",
    });
  });

  it("maps 400 with bare field shape to VALIDATION", () => {
    const result = mapApiError(
      fakeAxiosError({ status: 400, data: { phone_number: ["bad format"] } }),
    );
    expect(result.fieldErrors).toEqual({ phone_number: "bad format" });
  });

  it("flattens nested field errors with dot notation", () => {
    const result = mapApiError(
      fakeAxiosError({
        status: 400,
        data: { result: { shop: { name: ["required"] } } },
      }),
    );
    expect(result.fieldErrors).toEqual({ "shop.name": "required" });
  });

  it("maps 5xx to SERVER", () => {
    const result = mapApiError(fakeAxiosError({ status: 500, data: { result: "boom" } }));
    expect(result.kind).toBe(ERROR_KINDS.SERVER);
    expect(result.message).toBe("boom");
  });

  it("maps network errors (no response) to NETWORK", () => {
    const result = mapApiError({ message: "Network Error", code: "ERR_NETWORK" });
    expect(result.kind).toBe(ERROR_KINDS.NETWORK);
    expect(result.status).toBe(0);
  });

  it("maps CircuitOpenError to CIRCUIT", () => {
    const err = { name: "CircuitOpenError", code: "ECIRCUIT_OPEN", message: "open" };
    const result = mapApiError(err);
    expect(result.kind).toBe(ERROR_KINDS.CIRCUIT);
    expect(result.status).toBe(503);
  });

  it("ignores `detail`, `code`, `success` keys when extracting field errors", () => {
    const result = mapApiError(
      fakeAxiosError({
        status: 400,
        data: {
          detail: "bad input",
          code: "validation_error",
          success: false,
          name: ["short"],
        },
      }),
    );
    expect(result.fieldErrors).toEqual({ name: "short" });
  });
});
