import api from '../axios';

/**
 * Upload up to 5 product images to Cloudinary via the backend.
 * @param {File[]} files  - Array of File objects from an <input type="file">
 * @returns {Promise<string[]>} - Array of Cloudinary secure URLs
 */
export const uploadImagesAPI = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data.images; // string[]
};
