import api from './axiosConfig';

// Fetch all cities with optional search & status filter
export const getCitiesApi = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const response = await api.get(`/admin/cities${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new city (supports FormData or JSON)
export const createCityApi = async (data) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await api.post('/admin/cities', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update existing city
export const updateCityApi = async (id, data) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/admin/cities/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a city by ID
export const deleteCityApi = async (id) => {
  try {
    const response = await api.delete(`/admin/cities/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Toggle active/inactive status
export const toggleCityStatusApi = async (id) => {
  try {
    const response = await api.patch(`/admin/cities/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==========================================
// Area / Sub-city API Services
// ==========================================

// Add a new area/subcity to a city
export const addAreaApi = async (cityId, data) => {
  try {
    const response = await api.post(`/admin/cities/${cityId}/areas`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update an existing area/subcity
export const updateAreaApi = async (cityId, areaId, data) => {
  try {
    const response = await api.put(`/admin/cities/${cityId}/areas/${areaId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete an area/subcity
export const deleteAreaApi = async (cityId, areaId) => {
  try {
    const response = await api.delete(`/admin/cities/${cityId}/areas/${areaId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Toggle active status of an area/subcity
export const toggleAreaStatusApi = async (cityId, areaId) => {
  try {
    const response = await api.patch(`/admin/cities/${cityId}/areas/${areaId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get City-wise and Area-wise vendor distribution analytics
export const getCityVendorDistributionApi = async () => {
  try {
    const response = await api.get('/admin/cities/vendor-distribution');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

