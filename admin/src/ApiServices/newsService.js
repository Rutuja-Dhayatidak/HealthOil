import api from './axiosConfig';

export const fetchNews = async (params = {}) => {
  const response = await api.get('/admin/right-sidebar-news', { params });
  return response.data;
};

export const fetchNewsById = async (id) => {
  const response = await api.get(`/admin/right-sidebar-news/${id}`);
  return response.data;
};

export const createNews = async (formData) => {
  const response = await api.post('/admin/right-sidebar-news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateNews = async (id, formData) => {
  const response = await api.put(`/admin/right-sidebar-news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const toggleNewsStatus = async (id, isActive) => {
  const response = await api.patch(`/admin/right-sidebar-news/${id}/status`, { isActive });
  return response.data;
};

export const reorderNews = async (orderedIds) => {
  const response = await api.put('/admin/right-sidebar-news/reorder', { orderedIds });
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await api.delete(`/admin/right-sidebar-news/${id}`);
  return response.data;
};

export const fetchNewsResources = async () => {
  const response = await api.get('/admin/right-sidebar-news/resources');
  return response.data;
};
