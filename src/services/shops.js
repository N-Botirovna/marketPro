import http from "@/lib/http";

// Get shops with all filtering options
export async function getShops(params = {}) {
  const { data } = await http.get("api/v1/shop/list", { params });
  return {
    shops: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Get single shop by ID
export async function getShopById(id) {
  const { data } = await http.get(`api/v1/shop/${id}`);
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
