import { describe, it, expect, vi, beforeEach } from "vitest";

// C-4: refresh token lives in an HttpOnly cookie. These tests pin the
// frontend's cookie-mode behaviour (COOKIE_REFRESH === true).

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
const store = vi.hoisted(() => ({ map: {} }));

vi.mock("@/lib/http", () => ({
  default: { post, defaults: { headers: { common: {} } } },
}));
vi.mock("@/utils/storage", () => ({
  setItem: vi.fn((k, v) => {
    store.map[k] = v;
  }),
  getItem: vi.fn((k) => (k in store.map ? store.map[k] : null)),
  removeItem: vi.fn((k) => {
    delete store.map[k];
  }),
}));
vi.mock("@/utils/authStorage", () => ({ clearAuthStorage: vi.fn() }));
vi.mock("@/lib/idempotency", () => ({ withIdempotency: (c = {}) => c }));

import { COOKIE_REFRESH } from "@/config";
import { setItem } from "@/utils/storage";
import {
  refreshAccessToken,
  loginWithPhoneOtp,
  isRefreshTokenExpired,
  hasRefreshSession,
  logoutUser,
} from "@/services/auth";

beforeEach(() => {
  post.mockReset();
  setItem.mockClear();
  store.map = {};
});

describe("cookie-mode auth (C-4)", () => {
  it("the cookie-refresh flag is enabled", () => {
    expect(COOKIE_REFRESH).toBe(true);
  });

  it("refresh posts an empty body — the HttpOnly cookie authenticates it", async () => {
    post.mockResolvedValue({ data: { access_token: "AAA", expires_in: 4800 } });
    await refreshAccessToken();
    const [url, body, cfg] = post.mock.calls[0];
    expect(url).toContain("refresh");
    expect(body).toEqual({});
    expect(cfg.skipAuthRefresh).toBe(true);
  });

  it("login persists the access token but NOT the refresh token", async () => {
    post.mockResolvedValue({
      data: { access_token: "AAA", refresh_token: "RRR", expires_in_seconds: 4800 },
    });
    await loginWithPhoneOtp({ phone_number: "+998900000000", otp_code: "123456" });
    const keys = setItem.mock.calls.map((c) => c[0]);
    expect(keys).toContain("auth_token");
    expect(keys).toContain("login_time");
    expect(keys).not.toContain("refresh_token");
  });

  it("isRefreshTokenExpired defers to the server (false) in cookie mode", () => {
    expect(isRefreshTokenExpired()).toBe(false);
  });

  // FE-H1/H3: the single session oracle. In cookie mode the refresh token is
  // HttpOnly, so `login_time` is the only JS-visible proof of a session.
  it("hasRefreshSession tracks the login_time marker in cookie mode", () => {
    expect(hasRefreshSession()).toBe(false);
    setItem("login_time", Date.now());
    expect(hasRefreshSession()).toBe(true);
  });

  // FE-H2: logout MUST hit the endpoint even with no JS-readable refresh token,
  // so the HttpOnly cookie gets blacklisted + cleared server-side.
  it("logout calls the endpoint with an empty body in cookie mode", async () => {
    post.mockResolvedValue({ data: { result: "ok", success: true } });
    await logoutUser();
    expect(post).toHaveBeenCalledTimes(1);
    const [url, body, cfg] = post.mock.calls[0];
    expect(url).toContain("logout");
    expect(body).toEqual({});
    expect(cfg.skipAuthRefresh).toBe(true);
  });
});
