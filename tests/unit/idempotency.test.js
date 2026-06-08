import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Flag-gated module — re-import per test with the env var set so we don't
// depend on order. The module reads process.env at the time withIdempotency()
// is called (function body), so we can flip the env between tests.
import { newIdempotencyKey, withIdempotency } from "@/lib/idempotency";

const ORIGINAL = process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY;

beforeEach(() => {
  process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY = "1";
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY;
  else process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY = ORIGINAL;
});

describe("newIdempotencyKey", () => {
  it("returns a UUID-like 36-char string", () => {
    const key = newIdempotencyKey();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("returns a unique key each call", () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).not.toBe(b);
  });
});

describe("withIdempotency (flag enabled)", () => {
  it("adds an Idempotency-Key header to an empty config", () => {
    const config = withIdempotency();
    expect(config.headers["Idempotency-Key"]).toBeTruthy();
  });

  it("preserves existing headers", () => {
    const config = withIdempotency({ headers: { Authorization: "Bearer x" } });
    expect(config.headers.Authorization).toBe("Bearer x");
    expect(config.headers["Idempotency-Key"]).toBeTruthy();
  });

  it("respects a pre-provided key (important for explicit retry of same action)", () => {
    const config = withIdempotency({}, "fixed-key-1");
    expect(config.headers["Idempotency-Key"]).toBe("fixed-key-1");
  });

  it("does not override an existing Idempotency-Key in headers", () => {
    const config = withIdempotency({ headers: { "Idempotency-Key": "existing" } });
    expect(config.headers["Idempotency-Key"]).toBe("existing");
  });
});

describe("withIdempotency (enabled by default when unset)", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY;
  });

  it("adds the header when the env flag is unset (default ON)", () => {
    const config = withIdempotency({ headers: { Authorization: "Bearer x" } });
    expect(config.headers["Idempotency-Key"]).toBeTruthy();
    expect(config.headers.Authorization).toBe("Bearer x");
  });

  it("preserves any caller-provided timeout/config alongside the header", () => {
    const config = withIdempotency({ timeout: 60000 });
    expect(config.timeout).toBe(60000);
    expect(config.headers["Idempotency-Key"]).toBeTruthy();
  });
});

describe("withIdempotency (escape hatch — explicitly disabled)", () => {
  it.each(["0", "false", "off", "OFF", "False"])("is a no-op when the flag is %s", (val) => {
    process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY = val;
    const config = withIdempotency({ headers: { Authorization: "Bearer x" } });
    expect(config.headers?.["Idempotency-Key"]).toBeUndefined();
    expect(config.headers.Authorization).toBe("Bearer x");
  });

  it("does not add the header even when an explicit key is passed", () => {
    process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY = "0";
    const config = withIdempotency({}, "fixed-key-1");
    expect(config.headers?.["Idempotency-Key"]).toBeUndefined();
  });
});
