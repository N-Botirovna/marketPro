import { describe, it, expect } from "vitest";
import { isProfileComplete, getRegionId, getDistrictId } from "@/utils/profile";

// Posting a book requires a complete profile: region AND district. The backend
// enforces the same rule (rejecting with `profile_incomplete`); these tests pin
// the frontend pre-check that decides whether to open the create flow or route
// the user to the profile editor. region/district arrive either as nested
// objects ({id,...}) or bare ids, so both shapes must be handled.

describe("getRegionId / getDistrictId", () => {
  it("reads a bare id", () => {
    expect(getRegionId({ region: 12 })).toBe(12);
    expect(getDistrictId({ district: "34" })).toBe("34");
  });

  it("reads a nested object id", () => {
    expect(getRegionId({ region: { id: 5, name: "Toshkent" } })).toBe(5);
    expect(getDistrictId({ district: { id: 9, name: "Chilonzor" } })).toBe(9);
  });

  it("returns null for missing / empty values", () => {
    expect(getRegionId({})).toBeNull();
    expect(getRegionId({ region: "" })).toBeNull();
    expect(getRegionId({ region: null })).toBeNull();
    expect(getDistrictId(null)).toBeNull();
  });
});

describe("isProfileComplete", () => {
  it("is true only when both region and district are present", () => {
    expect(isProfileComplete({ region: 1, district: 2 })).toBe(true);
    expect(isProfileComplete({ region: { id: 1 }, district: { id: 2 } })).toBe(true);
  });

  it("is false when either is missing", () => {
    expect(isProfileComplete({ region: 1 })).toBe(false);
    expect(isProfileComplete({ district: 2 })).toBe(false);
    expect(isProfileComplete({ region: 1, district: "" })).toBe(false);
    expect(isProfileComplete({})).toBe(false);
    expect(isProfileComplete(null)).toBe(false);
  });
});
