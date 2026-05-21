# 🔐 Auth System - To'liq Tuzatildi

## ✅ Tuzatilgan Muammolar

### 1. **Storage Muammosi** ❌→✅

**Oldin:**

```javascript
// Tokenlar ham JSON.stringify qilinardi
setItem("auth_token", token); // "token" → "\"token\""
```

**Keyin:**

```javascript
// String sifatida to'g'ridan-to'g'ri saqlanadi
if (typeof value === "string") {
  localStorage.setItem(key, value); // token → token
}
```

### 2. **Cheksiz Refresh Loop** ❌→✅

**Oldin:**

- Har 30 sekundda refresh tekshirilardi
- Har bir API request refresh qilishga urinardi
- Token mavjud bo'lmasa ham refresh bo'lardi

**Keyin:**

```javascript
// Faqat kerak bo'lganda refresh
- Har 5 daqiqada tekshirish
- Faqat 1 daqiqa qolganida refresh
- Token bo'lmasa refresh yo'q
- Promise caching (bir vaqtda faqat 1 refresh)
```

### 3. **Token Expiry Logic** ❌→✅

**Oldin:**

```javascript
// 5 daqiqa oldin refresh (juda erta!)
const refreshBuffer = 5 * 60 * 1000;
```

**Keyin:**

```javascript
// Faqat 1 daqiqa qolganida
const refreshBuffer = 1 * 60 * 1000;
// Yoki to'g'ridan-to'g'ri expired bo'lsa
return now >= expiresAt;
```

### 4. **Refresh Token Validation** ❌→✅

**Oldin:**

```javascript
// 24 soat buffer (noto'g'ri!)
const bufferTime = 24 * 60 * 60 * 1000;
return now >= exp - bufferTime;
```

**Keyin:**

```javascript
// Buffer yo'q, faqat real expiry
return now >= exp;
// + 14 kunlik fallback
```

## 🎯 Yangi Xususiyatlar

### Token Hayot Tsikli

```
Login
  ↓
Access Token: 1 soat 20 daqiqa (4800s)
Refresh Token: 14 kun
  ↓
Token 1 daqiqa qolganida → Auto refresh
  ↓
Refresh token muddati tugagunga qadar
  ↓
Avtomatik logout
```

### Storage Structure

```javascript
localStorage = {
  auth_token: "eyJhbGc...", // Access token (string)
  refresh_token: "eyJhbGc...", // Refresh token (string)
  token_expires_at: 1234567890, // Timestamp (number)
  login_time: 1234567890, // Login vaqti (number)
};
```

### Refresh Strategiyasi

1. **Passive Check**: Har 5 daqiqada
2. **Active Check**: Har API request oldida
3. **Smart Refresh**: Faqat 1 daqiqa qolganida
4. **No Duplicate**: Promise caching

## 📊 Taqqoslash

| Xususiyat              | Oldin  | Keyin         |
| ---------------------- | ------ | ------------- |
| **Refresh chastotasi** | 30s    | 5min          |
| **Refresh buffer**     | 5 min  | 1 min         |
| **Storage format**     | JSON   | String/Native |
| **Infinite loop**      | ✅ Bor | ❌ Yo'q       |
| **Duplicate refresh**  | ✅ Bor | ❌ Yo'q       |
| **Production logs**    | Ko'p   | Minimal       |

## 🚀 Foydalanish

### Login

```javascript
import { loginWithPhoneOtp } from "@/services/auth";

const result = await loginWithPhoneOtp({
  phone_number: "+998901234567",
  otp_code: "123456",
});

// Tokenlar avtomatik saqlanadi
// 14 kungacha qayta login kerak emas!
```

### Auto Refresh

```javascript
// Avtomatik ishlaydi, hech narsa qilish kerak emas!
// Token 1 daqiqa qolganida avtomatik refresh bo'ladi
```

### Logout

```javascript
import { logoutUser } from "@/services/auth";

await logoutUser();
// Barcha tokenlar tozalanadi
```

### Check Auth Status

```javascript
import { useAuth } from "@/hooks/useAuth";

const { isAuthenticated, isLoading, token } = useAuth();

if (isLoading) return <Spinner />;
if (!isAuthenticated) return <Login />;
return <Dashboard />;
```

## 🔧 Texnik Detalllar

### Token Refresh Flow

```
1. User login qildi
   ↓
2. Access + Refresh tokenlar saqlandi
   ↓
3. 1 soat 19 daqiqa o'tdi
   ↓
4. Token 1 daqiqa qoldi, auto refresh triggered
   ↓
5. Yangi access token olindi
   ↓
6. Yana 1 soat 20 daqiqa davom etadi
   ↓
7. Refresh token (14 kun) tugamaguncha takrorlanadi
```

### Error Handling

```javascript
// Refresh token expired
isRefreshTokenExpired() === true
  ↓
Auto logout
  ↓
Redirect to login

// Access token refresh failed
refreshAccessToken() throws error
  ↓
Clear all tokens
  ↓
Auto logout
```

## 📝 Migration Guide

Agar oldingi versiyadan migrate qilsangiz:

```bash
# 1. LocalStorage ni tozalang
localStorage.clear()

# 2. Qayta login qiling
# Yangi tokenlar to'g'ri formatda saqlanadi

# 3. Test qiling
# Console da "Proactively refreshing token" spam bo'lmasligi kerak
```

## ⚠️ Muhim Eslatmalar

1. **Refresh Token Security**: Production da refresh token httpOnly cookie bo'lishi kerak
2. **Token Rotation**: Har refresh da yangi refresh token qaytarish tavsiya etiladi
3. **Login Time**: 14 kundan keyin user qayta login qilishi kerak
4. **HTTPS**: Tokenlar faqat HTTPS orqali yuborilishi kerak

## 🧪 Test Scenariolar

### Test 1: Login

```
✅ Login qiling
✅ Token saqlanishini tekshiring
✅ Sahifa reload qilganda login saqlanishi kerak
```

### Test 2: Auto Refresh

```
✅ 1 soat 19 daqiqa kuting (yoki console da test)
✅ Token avtomatik refresh bo'lishi kerak
✅ Console da 1 marta "Token refresh needed" ko'rinishi kerak
```

### Test 3: Logout

```
✅ Logout qiling
✅ Barcha tokenlar o'chirilishi kerak
✅ Login sahifasiga redirect bo'lishi kerak
```

### Test 4: Expired Refresh Token

```
✅ 14 kundan keyin (yoki console da test)
✅ Avtomatik logout bo'lishi kerak
✅ Login sahifasi ochilishi kerak
```

## 📚 API Reference

### Main Functions

```javascript
// Check if authenticated
isAuthenticated(): boolean

// Check if token expired
isTokenExpired(): boolean

// Check if refresh needed
shouldRefreshToken(): boolean

// Refresh if needed
refreshTokenIfNeeded(): Promise<boolean>

// Logout
logoutUser(): Promise<void>

// Check refresh token
isRefreshTokenExpired(): boolean
```

---

**Versiya:** 2.0.0  
**Sana:** 2024  
**Status:** ✅ Production Ready  
**Muammo:** Infinite loop, storage issues, wrong expiry logic  
**Yechim:** Smart refresh, proper storage, correct validation
