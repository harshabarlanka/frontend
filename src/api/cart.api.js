import api from './axios'

export const getCartAPI       = ()       => api.get('/cart')
export const addToCartAPI     = (data)   => api.post('/cart/add', data)
export const updateCartItemAPI = (itemId, quantity) => api.patch(`/cart/item/${itemId}`, { quantity })
export const removeCartItemAPI = (itemId) => api.delete(`/cart/item/${itemId}`)
export const clearCartAPI     = ()       => api.delete('/cart/clear')
