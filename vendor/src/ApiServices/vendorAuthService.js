import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vendorToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerVendor = async (data) => {
  try {
    const response = await api.post('/vendors/register', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginVendor = async (email, password) => {
  try {
    const response = await api.post('/vendors/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendorData', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const saveBusinessDetails = async (data) => {
  try {
    const response = await api.post('/vendors/onboarding/business', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadVendorDocument = async (documentType, file) => {
  try {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', file);
    
    const response = await api.post('/vendors/onboarding/documents', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const saveBankDetails = async (data) => {
  try {
    const response = await api.post('/vendors/onboarding/bank', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitApplication = async () => {
  try {
    const response = await api.post('/vendors/onboarding/submit');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/vendors/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Product APIs ---

export const getProducts = async () => {
  try {
    const response = await api.get('/v1/vendor/products');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProduct = async (id) => {
  // fetch single product details
  try {
    const response = await api.get(`/v1/vendor/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/v1/vendor/products', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProduct = async (id, updateData) => {
  try {
    const response = await api.patch(`/v1/vendor/products/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadProductImages = async (id, formData) => {
  try {
    const response = await api.post(`/v1/vendor/products/${id}/images`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const publishProduct = async (id) => {
  try {
    const response = await api.post(`/v1/vendor/products/${id}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const checkSku = async (skuCode) => {
  try {
    const response = await api.get(`/v1/vendor/variants/check-sku?skuCode=${skuCode}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getOilConfig = async () => {
  try {
    const response = await api.get('/v1/vendor/config/oil-options');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Inventory APIs ---

export const getInventoryList = async (params) => {
  try {
    const response = await api.get(`/v1/vendor/inventory?${new URLSearchParams(params).toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const adjustInventory = async (variantId, data) => {
  try {
    const response = await api.patch(`/v1/vendor/inventory/${variantId}/adjust`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateThreshold = async (variantId, lowStockThreshold) => {
  try {
    const response = await api.patch(`/v1/vendor/inventory/${variantId}/threshold`, { lowStockThreshold });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getLedger = async (params) => {
  try {
    const response = await api.get(`/v1/vendor/inventory/ledger?${new URLSearchParams(params).toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportInventory = async (params) => {
  try {
    const response = await api.get(`/v1/vendor/inventory/export?${new URLSearchParams(params).toString()}`, { responseType: 'blob' });
    return response.data; // Note: this is a blob
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const importInventory = async (formData) => {
  try {
    const response = await api.post('/v1/vendor/inventory/import', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getImportStatus = async (jobId) => {
  try {
    const response = await api.get(`/v1/vendor/inventory/import/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Shop Profile APIs ---

export const getStoreProfile = async () => {
  try {
    const response = await api.get('/vendors/shop/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateStoreProfile = async (data) => {
  try {
    const response = await api.put('/vendors/shop/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadStoreImages = async (formData) => {
  try {
    const response = await api.post('/vendors/shop/profile/images', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
