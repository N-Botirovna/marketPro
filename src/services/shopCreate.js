import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Create shop
export async function createShop(shopData) {
  const formData = new FormData();

  Object.keys(shopData).forEach(key => {
    const value = shopData[key];
    if (value !== '' && value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  try {
    const { data } = await http.post(API_ENDPOINTS.SHOPS.CREATE, formData);

    if (data?.success === false) {
      return {
        success: false,
        message: data?.result || "API xatoligi",
        raw: data,
      };
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
      message: error?.normalized?.message || error?.response?.data?.result || "Sotuvchi hisobi yaratishda xatolik yuz berdi",
      error: error,
    };
  }
}
