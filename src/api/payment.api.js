import api from './axios'

export const verifyPaymentAPI = (data) => api.post('/payment/verify', data)
