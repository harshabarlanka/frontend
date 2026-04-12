import api from './axios'

export const updateProfileAPI  = (data) => api.put('/users/profile', data)
export const changePasswordAPI = (data) => api.patch('/users/change-password', data)
export const addAddressAPI     = (data) => api.post('/users/address', data)
export const updateAddressAPI  = (id, data) => api.put(`/users/address/${id}`, data)
export const deleteAddressAPI  = (id)   => api.delete(`/users/address/${id}`)
