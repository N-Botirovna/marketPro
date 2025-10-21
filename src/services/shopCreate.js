import http from "@/lib/http";

// Create shop
export async function createShop(shopData) {
  console.log('🏪 Creating shop with data:', shopData);
  
  // Create FormData for file upload
  const formData = new FormData();
  
  // Add all fields to FormData
  Object.keys(shopData).forEach(key => {
    const value = shopData[key];
    if (value !== '' && value !== null && value !== undefined) {
      if (key === 'picture' && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    }
  });
  
  console.log('📁 FormData created:', formData);
  
  try {
    const { data } = await http.post("api/v1/shop/create/", formData);
    console.log('✅ Shop created successfully:', data);
    
    // Check if API returned success
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
    console.error('❌ Shop creation error:', error);
    console.error('❌ Error details:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message
    });
    
    return {
      success: false,
      message: error?.normalized?.message || error?.response?.data?.result || "Sotuvchi hisobi yaratishda xatolik yuz berdi",
      error: error,
    };
  }
}
