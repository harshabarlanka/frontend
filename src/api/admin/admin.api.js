import api from "../axios";

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardAPI = () => api.get("/admin/dashboard");
export const getAnalyticsAPI = (period) =>
  api.get("/admin/analytics", { params: { period } });

// ── Orders ───────────────────────────────────────────────────────────────────
export const getAdminOrdersAPI = (params) =>
  api.get("/admin/orders", { params });
export const getAdminOrderAPI = (id) => api.get(`/admin/orders/${id}`);
export const markReadyForPickupAPI = (id) =>
  api.post(`/admin/orders/${id}/ready-for-pickup`);
export const updateOrderStatusAPI = (id, status, note = "") =>
  api.patch(`/admin/orders/${id}/status`, { status, note });
export const shipOrderAPI = (id) => api.post(`/admin/orders/${id}/ship`);
export const retryShipmentAPI = (id) =>
  api.post(`/admin/orders/${id}/retry-shipment`);

// Feature 3: Invoice & Label download
export const getOrderInvoiceAPI = (id) =>
  api.get(`/admin/orders/${id}/invoice`);
export const getOrderLabelAPI = (id) => api.get(`/admin/orders/${id}/label`);

export const refundOrderAPI = (id) => api.post(`/admin/orders/${id}/refund`);

// ── Products ──────────────────────────────────────────────────────────────────
export const createProductAPI = (data) => api.post("/products", data);
export const updateProductAPI = (id, data) => api.put(`/products/${id}`, data);
export const deleteProductAPI = (id) => api.delete(`/products/${id}`);
export const getAdminProductsAPI = (params) =>
  api.get("/products", { params: { ...params, limit: 50 } });

// ── Users ────────────────────────────────────────────────────────────────────
export const getAdminUsersAPI = (params) => api.get("/admin/users", { params });
export const toggleUserStatusAPI = (id) =>
  api.patch(`/admin/users/${id}/toggle-status`);

// ── Cancel order (admin using user-facing route) ───────────────────────────────
export const adminCancelOrderAPI = (id, reason = "") =>
  api.patch(`/admin/orders/${id}/status`, {
    status: "cancelled",
    note: reason,
  });

// ── Feature 2: Coupon Management (Admin) ──────────────────────────────────────
export const getAdminCouponsAPI = (params) =>
  api.get("/admin/coupons", { params });
export const createCouponAPI = (data) => api.post("/admin/coupons", data);
export const updateCouponAPI = (id, data) =>
  api.put(`/admin/coupons/${id}`, data);
export const deleteCouponAPI = (id) => api.delete(`/admin/coupons/${id}`);

// ── Feature 2: Coupon validate (user-facing) ──────────────────────────────────
export const validateCouponAPI = (code, orderSubtotal) =>
  api.post("/coupons/validate", { code, orderSubtotal });
