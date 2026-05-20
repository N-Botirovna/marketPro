import http, { clearHttpCache } from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { withIdempotency } from "@/lib/idempotency";

// Create shop
export async function createShop(shopData) {
  const formData = new FormData();

  Object.keys(shopData).forEach((key) => {
    const value = shopData[key];
    if (value !== "" && value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  try {
    const { data } = await http.post(API_ENDPOINTS.SHOPS.CREATE, formData, withIdempotency());

    if (data?.success === false) {
      return {
        success: false,
        message: data?.result || "API xatoligi",
        raw: data,
      };
    }

    // New shop changes both /shop/list/ (public directory) and /shop/my-list/
    // (owner profile). Drop everything shop-scoped so the next list view
    // includes the new row instead of waiting for the 10-minute TTL.
    try {
      clearHttpCache("/shop/");
    } catch {
      /* ignore */
    }

    return {
      success: true,
      shop: data,
      message: "Sotuvchi hisobi muvaffaqiyatli yaratildi!",
      raw: data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.normalized?.message ||
        error?.response?.data?.result ||
        "Sotuvchi hisobi yaratishda xatolik yuz berdi",
    };
  }
}
