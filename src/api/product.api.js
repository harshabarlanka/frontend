import api from './axios'

export const getProductsAPI    = (params) => api.get('/products', { params })
export const getProductAPI     = (slug)   => api.get(`/products/${slug}`)
export const getCategoriesAPI  = ()       => api.get('/products/categories')
export const addReviewAPI      = (id, data) => api.post(`/products/${id}/reviews`, data)
export const getReviewsAPI     = (id)     => api.get(`/products/${id}/reviews`)
