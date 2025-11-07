import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get active give-away
export async function getActiveGiveaway(params = {}) {
  try {
    const { data } = await http.get(API_ENDPOINTS.GIVEAWAY.ACTIVE, { params });
    return {
      giveaway: data || null,
      raw: data,
      success: !!data,
    };
  } catch (error) {
    console.error("❌ Error fetching active giveaway:", error);
    throw error;
  }
}

// Get all give-aways
export async function getGiveaways(params = {}) {
  try {
    const { data } = await http.get(API_ENDPOINTS.GIVEAWAY.LIST, { params });
    return {
      giveaways: data?.results || data?.result || [],
      count: data?.count || 0,
      next: data?.next || null,
      previous: data?.previous || null,
      raw: data,
    };
  } catch (error) {
    console.error("❌ Error fetching giveaways:", error);
    throw error;
  }
}

// Get specific give-away by ID
export async function getGiveawayById(id, params = {}) {
  try {
    const { data } = await http.get(`${API_ENDPOINTS.GIVEAWAY.DETAIL}/${id}/`, { params });
    return {
      giveaway: data || null,
      raw: data,
    };
  } catch (error) {
    console.error(`❌ Error fetching giveaway ${id}:`, error);
    throw error;
  }
}

