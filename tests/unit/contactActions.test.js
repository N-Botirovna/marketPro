import { describe, it, expect } from "vitest";
import { getContactActions } from "@/utils/contactActions";

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
