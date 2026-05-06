import api from './axios';

export const getCombosAPI = () => api.get('/combos');
export const getComboBySlugAPI = (slug) => api.get(`/combos/${slug}`);
