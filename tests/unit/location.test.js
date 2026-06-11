import { describe, it, expect } from "vitest";
import { bookOwnerLocation } from "@/utils/location";

// Book cards and the detail page render the poster's location from the flat
// `posted_by.region_name` / `posted_by.district_name` fields the backend's
// UserShortSerializer sends. These tests pin that contract — a regression to
// the old (never-existing) nested `region.name` path must fail here.

describe("bookOwnerLocation", () => {
  it("joins region and district, region first", () => {
    expect(
      bookOwnerLocation({
        posted_by: { region_name: "Toshkent", district_name: "Chilonzor" },
      }),
    ).toBe("Toshkent, Chilonzor");
  });

  it("falls back to the only part present", () => {
    expect(bookOwnerLocation({ posted_by: { region_name: "Toshkent" } })).toBe("Toshkent");
    expect(bookOwnerLocation({ posted_by: { district_name: "Chilonzor" } })).toBe("Chilonzor");
  });

  it("returns null when the payload has no location", () => {
    expect(bookOwnerLocation({ posted_by: {} })).toBeNull();
    expect(bookOwnerLocation({ posted_by: { region_name: null, district_name: "" } })).toBeNull();
  });

  it("returns null for shop books and missing payloads", () => {
    expect(bookOwnerLocation({ shop: { id: 1, name: "Do'kon" } })).toBeNull();
    expect(bookOwnerLocation(null)).toBeNull();
    expect(bookOwnerLocation(undefined)).toBeNull();
  });
});
