import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get user orders
export async function getOrders(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.ORDERS.LIST, { params });
  return {
    orders: data?.orders || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    raw: data,
  };
}

// Get single order by ID
export async function getOrderById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.ORDERS.DETAIL}/${id}`);
  return {
    order: data?.order || null,
    raw: data,
  };
}

// Create new order
export async function createOrder(orderData) {
  const { data } = await http.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
  return {
    success: data?.success || false,
    order: data?.order || null,
    message: data?.message || null,
    raw: data,
  };
}

// Update order status (if allowed)
export async function updateOrderStatus(orderId, status) {
  const payload = { status };
  const { data } = await http.put(`${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}`, payload);
  return {
    success: data?.success || false,
    order: data?.order || null,
    message: data?.message || null,
    raw: data,
  };
}

// Cancel order
export async function cancelOrder(orderId) {
  const { data } = await http.post(`${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/cancel`);
  return {
    success: data?.success || false,
    order: data?.order || null,
    message: data?.message || null,
    raw: data,
  };
}
