import api from './axiosConfig';

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/admin/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteUserApi = async (id, type) => {
  try {
    const response = await api.delete(`/admin/users/${id}?type=${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const toggleUserStatusApi = async (id, type) => {
  try {
    const response = await api.put(`/admin/users/${id}/suspend?type=${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPendingVendors = async () => {
  try {
    const response = await api.get('/admin/vendors/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getApprovedVendors = async () => {
  try {
    const response = await api.get('/admin/vendors/approved');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const approveVendor = async (id) => {
  try {
    const response = await api.patch(`/admin/vendors/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const rejectVendor = async (id, reason) => {
  try {
    const response = await api.patch(`/admin/vendors/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams()
    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.search) query.append('search', params.search)
    if (params.status) query.append('status', params.status)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await api.get(`/admin/products${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const approveProduct = async (id) => {
  try {
    const response = await api.patch(`/admin/products/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const rejectProduct = async (id) => {
  try {
    const response = await api.patch(`/admin/products/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProductAdmin = async (id, data) => {
  try {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteProductAdmin = async (id) => {
  try {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateVendorAdmin = async (id, data) => {
  try {
    const response = await api.put(`/admin/vendors/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

