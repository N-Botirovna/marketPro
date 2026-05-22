import { describe, it, expect } from "vitest";
import { localizedField } from "@/utils/localizedField";

describe("localizedField", () => {
  it("returns the explicit locale variant when present", () => {
    const obj = {
      name_uz: "Kitob",
      name_ru: "Книга",
      name_en: "Book",
      name_kaa: "Kitap",
    };
    expect(localizedField(obj, "name", "kaa")).toBe("Kitap");
    expect(localizedField(obj, "name", "ru")).toBe("Книга");
    expect(localizedField(obj, "name", "en")).toBe("Book");
    expect(localizedField(obj, "name", "uz")).toBe("Kitob");
  });

  it("falls back to the server-side proxy field when the requested locale is empty", () => {
    // Backend with a generic `name` proxy (Accept-Language resolved server-side).
    const obj = { name: "from-proxy", name_uz: "alt-uz" };
    expect(localizedField(obj, "name", "kaa")).toBe("from-proxy");
  });

  it("falls back through uz → ru → en when the locale variant is missing", () => {
    expect(localizedField({ name_uz: "uz-val" }, "name", "kaa")).toBe("uz-val");
    expect(localizedField({ name_ru: "ru-val" }, "name", "kaa")).toBe("ru-val");
    expect(localizedField({ name_en: "en-val" }, "name", "kaa")).toBe("en-val");
  });

  it("returns empty string for null / undefined input", () => {
    expect(localizedField(null, "name", "uz")).toBe("");
    expect(localizedField(undefined, "name", "uz")).toBe("");
  });

  it("returns empty string when the field is completely absent", () => {
    expect(localizedField({}, "name", "kaa")).toBe("");
    expect(localizedField({ other: "x" }, "name", "kaa")).toBe("");
  });

  it("works for non-default base fields like author/description", () => {
    const obj = {
      author_kaa: "Muallif KAA",
      description_ru: "Описание",
    };
    expect(localizedField(obj, "author", "kaa")).toBe("Muallif KAA");
    expect(localizedField(obj, "description", "ru")).toBe("Описание");
    expect(localizedField(obj, "description", "kaa")).toBe("Описание");
  });

  it("prefers the explicit locale variant over the generic proxy", () => {
    const obj = { name: "proxy", name_kaa: "exact" };
    expect(localizedField(obj, "name", "kaa")).toBe("exact");
  });

  it("ignores empty-string fields (treats them as missing)", () => {
    // Backend may serialize empty modeltranslation cells as "" rather than null.
    const obj = { name_kaa: "", name_uz: "fallback-uz" };
    expect(localizedField(obj, "name", "kaa")).toBe("fallback-uz");
  });
});
