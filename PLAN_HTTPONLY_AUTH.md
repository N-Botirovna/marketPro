# Plan — httpOnly-cookie authentication migration (C-4)

**Status:** designed, not executed.
**Owner:** Backend SWE + Frontend SWE pairing.
**Estimated effort:** 3–5 dev-days (BE + FE + CSRF + tests).

## Why we're doing this

`auth_token` and `refresh_token` currently live in `localStorage`
(`src/utils/storage.js:53-58`). Any XSS — including a future sanitize
allowlist gap, a compromised third-party dep, or a stored XSS that
slips through `validate_description` on the backend — reads both
tokens and exfiltrates them. The 14-day refresh token then gives the
attacker an account-takeover window that survives the victim logging
out.

The fix is to move tokens into `HttpOnly; Secure; SameSite=Strict`
cookies. JavaScript cannot read them, so XSS no longer escalates to
ATO. The price is CSRF protection on mutations, but Django already
ships `CsrfViewMiddleware` and we already set `CSRF_TRUSTED_ORIGINS`.

Phase 0 + Phase 1 partial mitigation:

- Self-hosted Phosphor (H-12) removes the unpkg CSP trust.
- CSP no longer includes `'unsafe-eval'` in prod (`next.config.js`).
- `dangerouslyAllowSVG: false` (M-25).
- ESLint warns on `dangerouslySetInnerHTML` outside the sanitize allowlist.

Those reduce the XSS surface but don't close it. C-4 closes it.

## Backend changes (`back-end/`)

### 1. `simplejwt` cookie wiring

Install the cookie middleware that `djangorestframework-simplejwt`
ships and switch login / refresh / logout to return `Set-Cookie`.

```python
# back-end/config/settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': ACCESS_TOKEN_LIFETIME,
    'REFRESH_TOKEN_LIFETIME': REFRESH_TOKEN_LIFETIME,
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    # New:
    'AUTH_COOKIE': 'kz_access',
    'AUTH_COOKIE_REFRESH': 'kz_refresh',
    'AUTH_COOKIE_DOMAIN': None,                  # same-origin
    'AUTH_COOKIE_SECURE': IS_PROD,
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_PATH': '/',
    'AUTH_COOKIE_SAMESITE': 'Strict' if IS_PROD else 'Lax',
}

REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = (
    'utils.auth.CookieJWTAuthentication',  # new — reads cookie, falls back to Bearer
)
```

### 2. `utils/auth.py` — CookieJWTAuthentication

```python
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    """Read the access token from cookie first, header second.

    Header fallback is intentional: the bot still calls Django via
    `Authorization: Bearer …` and we don't want to refactor that path.
    """
    def authenticate(self, request):
        raw = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if raw:
            validated = self.get_validated_token(raw)
            return self.get_user(validated), validated
        return super().authenticate(request)
```

### 3. Update Login / Refresh / Logout / Ticket views

After issuing tokens, set them on the response:

```python
response.set_cookie(
    settings.SIMPLE_JWT['AUTH_COOKIE'],
    access_token,
    max_age=settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
    httponly=True,
    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
)
response.set_cookie(
    settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
    refresh_token,
    max_age=settings.REFRESH_TOKEN_LIFETIME.total_seconds(),
    secure=...,
    httponly=True,
    samesite=...,
    path='/api/v1/auth/refresh/',   # narrow path scope — defense in depth
)
```

Refresh and logout endpoints read the refresh cookie instead of the
body. Logout deletes both cookies and blacklists the refresh token
(already done in H-3).

### 4. CSRF wiring

Switch mutation endpoints from anonymous-CSRF-exempt JWT to cookie
auth + CSRF. The DRF `SessionAuthentication` class already enforces
CSRF when the user is cookie-authenticated; mirror that on
`CookieJWTAuthentication`:

```python
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # ... cookie read ...
        if cookie_used:
            self.enforce_csrf(request)   # raise PermissionDenied on missing/bad token
```

Then `csrf_token` is exposed via a new `GET /api/v1/auth/csrf/`
endpoint that sets the `csrftoken` cookie. Frontend reads it from the
non-HttpOnly cookie and echoes it as `X-CSRFToken` on mutations.

## Frontend changes (`front-end/`)

### 1. Stop storing tokens in localStorage

Update `src/utils/storage.js`:

```js
// auth_token / refresh_token / token_expires_at are no longer stored.
// `user_data` + `login_time` can remain — they're not credentials.
export function clearAuthStorage() {
  ["user_data", "login_time"].forEach(removeItem);
}
```

Update `src/services/auth.js`:

- `loginWithPhoneOtp` / `loginWithCode` / `loginWithTicket` no longer
  parse `access_token` / `refresh_token` from the JSON response — they
  arrive via `Set-Cookie` instead. Response payload reduces to
  `{ user, expires_in }`.
- `refreshAccessToken` becomes a `POST /api/v1/auth/refresh/` with no
  body; cookies do the auth.
- `isTokenExpired` / `isRefreshTokenExpired` can no longer inspect
  token payloads (they're invisible). Switch to: call
  `GET /api/v1/auth/me/` — 200 = logged in, 401 = expired. Cache the
  result briefly.

### 2. axios changes (`src/lib/http.js`)

- Remove the `Authorization: Bearer …` header injection (lines 97-102).
- Set `withCredentials: true` on the axios instance so cookies travel
  cross-origin if FE/BE are on different domains.
- Add a request interceptor that attaches `X-CSRFToken` from the
  `csrftoken` cookie on mutations.
- The refresh queue stays — the queue still serializes parallel 401s
  through one refresh call.

### 3. CSP tightening

With tokens out of JS reach, we can drop `'unsafe-inline'` from
`script-src` once Emotion's runtime style injection is replaced (MUI
v9 supports nonces). Document as follow-up.

## Test plan

Before declaring done:

1. **Unit (FE):** axios interceptor sets `X-CSRFToken`; 401 → refresh →
   retry path still works when refresh cookie is present.
2. **Integration (BE):** `pytest` exercising `/login/` returns the
   expected `Set-Cookie` headers; `/refresh/` works with cookie-only.
3. **End-to-end (Playwright):** new spec — log in, navigate, log out,
   confirm `document.cookie` doesn't contain `kz_access` (HttpOnly
   means cookie is set but JS can't read it).
4. **Manual XSS smoke:** inject a stored XSS test (controlled
   environment), confirm `document.cookie` returns no auth values.
5. **Bot regression:** confirm the bot still authenticates with its
   `X-Bot-Secret` + `Authorization: Bearer` path (header fallback in
   `CookieJWTAuthentication` keeps this working).

## Rollout

- Deploy backend with the new cookie auth + the header fallback intact.
- Deploy frontend in the same window — old FE works against new BE
  because the header path still authenticates.
- Watch error rate for 24h. If green, drop the Bearer header path from
  the FE; keep it on the BE for the bot.

## Rollback

The cookie auth path is additive. Reverting is two steps:

1. Frontend: re-introduce `Authorization` header + localStorage writes.
2. Backend: switch `DEFAULT_AUTHENTICATION_CLASSES` back to the stock
   `JWTAuthentication`. Cookie issuance becomes a no-op the FE ignores.
