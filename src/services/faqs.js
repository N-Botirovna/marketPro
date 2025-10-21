import http from "@/lib/http";

// Get FAQs
export async function getFaqs(params = {}) {
  console.log('❓ Fetching FAQs with params:', params);
  
  // Filter out empty parameters
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleanParams[key] = value;
    }
  });
  
  console.log('🧹 Cleaned FAQ params:', cleanParams);
  
  try {
    const { data } = await http.get("api/v1/base/faqs", { params: cleanParams });
    console.log('✅ FAQs API response:', data);
    
    return {
      faqs: data?.results || data?.result || [],
      count: data?.count || 0,
      next: data?.next || null,
      previous: data?.previous || null,
      raw: data,
    };
  } catch (error) {
    console.error('❌ FAQs API error:', error);
    throw error;
  }
}

// Get single FAQ by ID
export async function getFaqById(id) {
  const { data } = await http.get(`api/v1/base/faqs/${id}/`);
  return {
    faq: data || null,
    raw: data,
  };
}
