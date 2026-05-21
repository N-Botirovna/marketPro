# 🔧 Token Refresh Infinite Loop - Tuzatildi

## ❌ Muammo

Site load bo'lganda infinite loop yuz berdi:

- Console da "Proactively refreshing token..." xabari qayta-qayta chiqdi
- Site to'xtab qoldi (freeze)
- Token refresh cheksiz takrorlandi

## 🔍 Sabab

**Infinite Loop:**

```
http.js → refreshTokenIfNeeded()
    ↓
auth.js → refreshAccessToken()
    ↓
auth.js → http.post(REFRESH_ENDPOINT)
    ↓
http.js → refreshTokenIfNeeded() ← YANA BOSHIDAN!
```

## ✅ Yechim

### 1. **Flag qo'shildi (isCurrentlyRefreshing)**

```javascript
let isCurrentlyRefreshing = false;

export async function refreshTokenIfNeeded() {
  // Prevent infinite loop
  if (isCurrentlyRefreshing) {
    return true;
  }

  if (shouldRefreshToken()) {
    try {
      isCurrentlyRefreshing = true;
      await refreshAccessToken();
    } finally {
      isCurrentlyRefreshing = false;
    }
  }
}
```

### 2. **Skip Auth Refresh Flag**

```javascript
// auth.js
const { data } = await http.post(
  API_ENDPOINTS.AUTH.REFRESH,
  {
    refresh_token: refreshToken,
  },
  {
    skipAuthRefresh: true, // Interceptorni skip qilish
  },
);
```

```javascript
// http.js
if (!config.skipAuthRefresh) {
  await refreshTokenIfNeeded();
}
```

### 3. **Token Mavjudligini Tekshirish**

```javascript
export function shouldRefreshToken() {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  const refreshToken = getItem("refresh_token");

  // Don't refresh if no tokens exist
  if (!token || !refreshToken) {
    return false;
  }
  // ...
}
```

### 4. **Production Log Cleanup**

```javascript
if (process.env.NODE_ENV === "development") {
  console.log("🔄 Proactively refreshing token...");
}
```

## 📊 O'zgarishlar

| Fayl                   | O'zgarish                              | Sabab                                  |
| ---------------------- | -------------------------------------- | -------------------------------------- |
| `src/services/auth.js` | `isCurrentlyRefreshing` flag qo'shildi | Loop oldini olish                      |
| `src/services/auth.js` | `skipAuthRefresh: true` flag           | Interceptorni bypass qilish            |
| `src/lib/http.js`      | `config.skipAuthRefresh` tekshiruvi    | Refresh endpoint uchun skip            |
| `src/services/auth.js` | Token mavjudligi tekshiruvi            | Bo'sh token bilan refresh oldini olish |
| Ikkala fayl            | Production log cleanup                 | Console spam yo'q qilish               |

## 🧪 Test

1. ✅ Build muvaffaqiyatli
2. ✅ Linter xatosiz
3. ✅ Infinite loop to'xtatildi
4. ✅ Token refresh to'g'ri ishlaydi

## 🚀 Ishlatish

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📝 Eslatmalar

- Token 5 daqiqa qolganida avtomatik refresh qilinadi
- Refresh xato bersa, tokenlar tozalanadi
- Production da console.log minimal
- Flag ikkita joyda (auth.js va http.js interceptor)

---

**Tuzatilgan:** 2024  
**Muammo:** Infinite token refresh loop  
**Yechim:** Flag + Skip mechanism + Token validation
