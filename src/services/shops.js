import http from "@/lib/http";

// Get shops with all filtering options
export async function getShops(params = {}) {
  console.log('🏪 getShops called with params:', params);
  
  // Filter out empty parameters
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleanParams[key] = value;
    }
  });
  
  console.log('🧹 Cleaned params:', cleanParams);
  console.log('🌐 Making request to: api/v1/shop/list/');
  
  try {
    const { data } = await http.get("api/v1/shop/list/", { params: cleanParams });
    console.log('✅ Shops API response:', data);
    
    // Debug: Check API response structure
    console.log('🔍 API Response structure:', {
      hasResult: !!data?.result,
      hasResults: !!data?.results,
      resultType: typeof data?.result,
      resultsType: typeof data?.results,
      resultLength: data?.result?.length || 0,
      resultsLength: data?.results?.length || 0,
      keys: Object.keys(data || {}),
      count: data?.count,
      success: data?.success
    });
    
    return {
      shops: data?.result || data?.results || [],
      count: data?.count || (data?.result?.length || 0),
      next: data?.next || null,
      previous: data?.previous || null,
      raw: data,
    };
  } catch (error) {
    console.error('❌ Shops API error:', error);
    throw error;
  }
}

// Get single shop by ID
export async function getShopById(id) {
  const { data } = await http.get(`api/v1/shop/${id}/`);
  return {
    shop: data || null,
    raw: data,
  };
}

// Get shops for homepage
export async function getHomePageShops(limit = 8) {
  return await getShops({ 
    is_active: true, 
    limit 
  });
}

// Get shops by region
export async function getShopsByRegion(regionId, limit = 12) {
  return await getShops({ 
    region: regionId,
    is_active: true, 
    limit 
  });
}

// Get shops by district
export async function getShopsByDistrict(districtId, limit = 12) {
  return await getShops({ 
    district: districtId,
    is_active: true, 
    limit 
  });
}

// Search shops
export async function searchShops(query, params = {}) {
  return await getShops({ 
    q: query,
    is_active: true,
    ...params 
  });
}

// Get shops by star rating
export async function getShopsByRating(minStar, maxStar, limit = 12) {
  return await getShops({ 
    star_min: minStar,
    star_max: maxStar,
    is_active: true, 
    limit 
  });
}

// Get shops by owner
export async function getShopsByOwner(ownerId, limit = 12) {
  return await getShops({ 
    owner: ownerId,
    is_active: true, 
    limit 
  });
}
