import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get cart items
export async function getCartItems() {
  const { data } = await http.get(API_ENDPOINTS.CART.LIST);
  return {
    items: data?.items || [],
    total: data?.total || 0,
    count: data?.count || 0,
    raw: data,
  };
}

// Add item to cart
export async function addToCart({ product_id, quantity = 1, variant_id = null }) {
  const payload = { product_id, quantity, variant_id };
  const { data } = await http.post(API_ENDPOINTS.CART.ADD, payload);
  return {
    success: data?.success || false,
    message: data?.message || null,
    item: data?.item || null,
    raw: data,
  };
}

// Update cart item quantity
export async function updateCartItem({ item_id, quantity }) {
  const payload = { quantity };
  const { data } = await http.put(`${API_ENDPOINTS.CART.UPDATE}/${item_id}`, payload);
  return {
    success: data?.success || false,
    message: data?.message || null,
    item: data?.item || null,
    raw: data,
  };
}

// Remove item from cart
export async function removeFromCart(item_id) {
  const { data } = await http.delete(`${API_ENDPOINTS.CART.REMOVE}/${item_id}`);
  return {
    success: data?.success || false,
    message: data?.message || null,
    raw: data,
  };
}

// Clear entire cart
export async function clearCart() {
  const { data } = await http.delete(API_ENDPOINTS.CART.LIST);
  return {
    success: data?.success || false,
    message: data?.message || null,
    raw: data,
  };
}
