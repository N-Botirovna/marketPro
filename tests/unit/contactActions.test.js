import { describe, it, expect } from "vitest";
import { contactPrefillKey, getContactActions } from "@/utils/contactActions";

describe("getContactActions", () => {
  const sellerWithBoth = {
    telegram_username: "seller_handle",
    phone_number: "+998 90 000 00 00",
    has_telegram: true,
    has_phone: true,
  };

  it("returns working hrefs for an authenticated viewer", () => {
    const a = getContactActions({
      postedBy: sellerWithBoth,
      isAuthenticated: true,
      prefill: "Salom «Kitob»",
    });
    expect(a.requiresLogin).toBe(false);
    expect(a.hasTelegram).toBe(true);
    expect(a.hasPhone).toBe(true);
    expect(a.tgUrl).toBe(`https://t.me/seller_handle?text=${encodeURIComponent("Salom «Kitob»")}`);
    expect(a.telHref).toBe("tel:+998900000000");
    expect(a.smsHref).toBe("sms:+998900000000");
  });

  it("flags requiresLogin and keeps buttons visible for anonymous viewers", () => {
    // Backend hides the actual handle/number from anonymous requests, but the
    // presence booleans still arrive so the buttons render (login-gated).
    const a = getContactActions({
      postedBy: { has_telegram: true, has_phone: true },
      isAuthenticated: false,
    });
    expect(a.requiresLogin).toBe(true);
    expect(a.hasTelegram).toBe(true);
    expect(a.hasPhone).toBe(true);
    // No raw handle/number → no direct href; the click is intercepted anyway.
    expect(a.tgUrl).toBeNull();
    expect(a.telHref).toBeNull();
  });

  it("strips a leading @ from the telegram handle", () => {
    const a = getContactActions({
      postedBy: { telegram_username: "@with_at", has_telegram: true },
      isAuthenticated: true,
    });
    expect(a.tgUrl).toContain("https://t.me/with_at?text=");
  });

  it("hides channels the seller does not have", () => {
    const a = getContactActions({
      postedBy: { has_telegram: false, has_phone: false },
      isAuthenticated: true,
    });
    expect(a.hasTelegram).toBe(false);
    expect(a.hasPhone).toBe(false);
    expect(a.tgUrl).toBeNull();
    expect(a.telHref).toBeNull();
    expect(a.smsHref).toBeNull();
  });

  it("falls back to resolved values when presence booleans are absent", () => {
    const a = getContactActions({
      postedBy: { telegram_username: "legacy", phone_number: "+998901112233" },
      isAuthenticated: true,
    });
    expect(a.hasTelegram).toBe(true);
    expect(a.hasPhone).toBe(true);
  });

  it("is null-safe when postedBy is missing", () => {
    const a = getContactActions({ postedBy: null, isAuthenticated: false });
    expect(a.hasTelegram).toBe(false);
    expect(a.hasPhone).toBe(false);
    expect(a.requiresLogin).toBe(true);
  });
});

describe("contactPrefillKey", () => {
  // Regression: a `wanted` post ("I'm looking for this book") reused the
  // supply copy, so the Telegram chat opened with "you posted this book, I
  // would like to buy it" — addressed to the person who had just asked for it.
  it("uses the demand wording for a wanted post", () => {
    expect(contactPrefillKey("wanted")).toBe("wantedContactPrefill");
    expect(contactPrefillKey("WANTED")).toBe("wantedContactPrefill");
  });

  it("keeps the supply wording for every listing type", () => {
    ["seller", "gift", "exchange", "rent"].forEach((type) => {
      expect(contactPrefillKey(type), type).toBe("contactPrefill");
    });
  });

  it("defaults to the supply wording for unknown / missing types", () => {
    expect(contactPrefillKey("")).toBe("contactPrefill");
    expect(contactPrefillKey(null)).toBe("contactPrefill");
    expect(contactPrefillKey(undefined)).toBe("contactPrefill");
  });

  it("seeds a Telegram deep-link whose text is the message it was given", () => {
    // The two halves the component wires together: the key above selects the
    // string, getContactActions encodes it into the t.me URL.
    const prefill = "Assalomu alaykum! «Alkimyogar» kitobini qidirayotgan ekansiz.";
    const { tgUrl } = getContactActions({
      postedBy: { telegram_username: "@aziz_k", has_telegram: true },
      isAuthenticated: true,
      prefill,
    });
    expect(tgUrl.startsWith("https://t.me/aziz_k?text=")).toBe(true);
    expect(decodeURIComponent(tgUrl.split("?text=")[1])).toBe(prefill);
  });
});
