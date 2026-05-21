import { describe, it, expect } from "vitest";
import { mapValidationError, pickFieldError } from "@/lib/mapValidationError";

function fakeAxiosError({ status, data }) {
  return { response: { status, data }, message: "x" };
}

describe("mapValidationError", () => {
  it("returns general + fields on 400 with field errors", () => {
    const result = mapValidationError(
      fakeAxiosError({
        status: 400,
        data: { result: { name: ["Required"] }, success: false },
      }),
    );
    expect(result.fields).toEqual({ name: "Required" });
    // no general msg when only field-level errors
    expect(result.general).toBeNull();
  });

  it("returns general msg only for non-validation kinds", () => {
    const result = mapValidationError(fakeAxiosError({ status: 500, data: { result: "boom" } }));
    expect(result.general).toBe("boom");
    expect(result.fields).toEqual({});
  });

  it("falls back to localized message on 401", () => {
    const result = mapValidationError(fakeAxiosError({ status: 401, data: {} }));
    expect(result.general).toBeTruthy();
    expect(result.kind).toBe("auth");
  });

  it("handles 400 with no field errors (general message present)", () => {
    const result = mapValidationError(
      fakeAxiosError({ status: 400, data: { result: "Invalid request" } }),
    );
    expect(result.general).toBe("Invalid request");
    expect(result.fields).toEqual({});
  });
});

describe("pickFieldError", () => {
  it("returns empty string when no error", () => {
    expect(pickFieldError({}, "name")).toBe("");
    expect(pickFieldError(null, "name")).toBe("");
    expect(pickFieldError({ name: "Required" }, null)).toBe("");
  });

  it("returns the matching error string", () => {
    expect(pickFieldError({ name: "Required" }, "name")).toBe("Required");
  });
});
