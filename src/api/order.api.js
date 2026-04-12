import api from './axios'

export const placeOrderAPI    = (data) => api.post('/orders', data)
export const getMyOrdersAPI   = (params) => api.get('/orders', { params })
export const getOrderAPI      = (id)   => api.get(`/orders/${id}`)
export const cancelOrderAPI   = (id)   => api.post(`/orders/${id}/cancel`)
export const trackOrderAPI    = (id)   => api.get(`/orders/${id}/track`)
