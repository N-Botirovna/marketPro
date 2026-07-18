import { describe, it, expect, beforeEach, afterEach } from "vitest";

// The login page + AuthRequiredModal render a Telegram "go to bot" deep-link
// from getBotUrl(). When NEXT_PUBLIC_BOT_USERNAME is unset (env drift on a
// rebuild), the link falls back to a default handle — that default MUST be a
// bot that actually exists, otherwise the link opens a dead t.me profile and
// the whole OTP login flow is unreachable. This pins that contract.

const ENV_KEY = "NEXT_PUBLIC_BOT_USERNAME";

async function freshEnv() {
  // env.js reads process.env at call time, but Vite caches the module — reset
  // the registry so each case re-imports with the current process.env.
  const mod = await import("@/config/env");
  return mod;
}

describe("getBotUsername / getBotUrl", () => {
  let original;

  beforeEach(() => {
    original = process.env[ENV_KEY];
  });

  afterEach(() => {
    if (original === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = original;
  });

  it("defaults to the live bot when the env var is unset", async () => {
    delete process.env[ENV_KEY];
    const { getBotUsername, getBotUrl } = await freshEnv();
    // The live dev/prod bot — must stay in sync with .env.production.example.
    expect(getBotUsername()).toBe("kitobzorim_bot");
    expect(getBotUrl()).toBe("https://t.me/kitobzorim_bot");
    expect(getBotUrl({ start: "login" })).toBe("https://t.me/kitobzorim_bot?start=login");
  });

  it("uses the configured handle and strips @ / t.me prefixes", async () => {
    process.env[ENV_KEY] = "@custom_bot";
    const { getBotUsername } = await freshEnv();
    expect(getBotUsername()).toBe("custom_bot");

    process.env[ENV_KEY] = "https://t.me/other_bot";
    const again = await freshEnv();
    expect(again.getBotUsername()).toBe("other_bot");
  });
});
