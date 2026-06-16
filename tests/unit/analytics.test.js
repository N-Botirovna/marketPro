import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    delete window.dataLayer;
    delete window.gtag;
    delete window.posthog;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pushes to window.dataLayer when present (GA4/GTM)", () => {
    window.dataLayer = [];
    trackEvent("book_gift_share", { book_id: 42, mode: "gift" });
    expect(window.dataLayer).toEqual([{ event: "book_gift_share", book_id: 42, mode: "gift" }]);
  });

  it("calls window.gtag when present", () => {
    window.gtag = vi.fn();
    trackEvent("book_share", { book_id: 7 });
    expect(window.gtag).toHaveBeenCalledWith("event", "book_share", { book_id: 7 });
  });

  it("calls posthog.capture when present", () => {
    window.posthog = { capture: vi.fn() };
    trackEvent("search", { q: "aytmatov" });
    expect(window.posthog.capture).toHaveBeenCalledWith("search", { q: "aytmatov" });
  });

  it("is a safe no-op when no provider is wired", () => {
    expect(() => trackEvent("book_share", { book_id: 1 })).not.toThrow();
  });

  it("ignores an empty event name", () => {
    window.dataLayer = [];
    trackEvent("");
    expect(window.dataLayer).toEqual([]);
  });

  it("never throws if a provider itself throws", () => {
    window.gtag = () => {
      throw new Error("sdk boom");
    };
    expect(() => trackEvent("book_share", { book_id: 1 })).not.toThrow();
  });
});
