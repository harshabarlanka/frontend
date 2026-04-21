import api from "../axios";

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardAPI = () => api.get("/admin/dashboard");
export const getAnalyticsAPI = (period) =>
  api.get("/admin/analytics", { params: { period } });

// ── Orders ───────────────────────────────────────────────────────────────────
export const getAdminOrdersAPI = (params) =>
  api.get("/admin/orders", { params });
export const getAdminOrderAPI = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatusAPI = (id, status, note = "") =>
  api.patch(`/admin/orders/${id}/status`, { status, note });
export const shipOrderAPI = (id) => api.post(`/admin/orders/${id}/ship`);

// ── Products (reuses existing product routes) ─────────────────────────────────
// FIX Bug 6: Was /products/id/${id} — that path does not match the backend
// PUT /products/:id route. Correct URL is simply /products/${id}.
export const createProductAPI = (data) => api.post("/products", data);
export const updateProductAPI = (id, data) => api.put(`/products/${id}`, data);
export const deleteProductAPI = (id) => api.delete(`/products/${id}`);
export const getAdminProductsAPI = (params) =>
  api.get("/products", { params: { ...params, limit: 50 } });

// ── Users ────────────────────────────────────────────────────────────────────
export const getAdminUsersAPI = (params) => api.get("/admin/users", { params });
export const toggleUserStatusAPI = (id) =>
  api.patch(`/admin/users/${id}/toggle-status`);
export const generateLabelAPI = (orderId) =>
  api.get(`/admin/orders/${orderId}/label`);

// ── Cancel order (uses existing user-facing route) ────────────────────────────
export const adminCancelOrderAPI = (id) => api.post(`/orders/${id}/cancel`);
