import api from './api';

export const getPublicShops = async (page = 1, limit = 15) => {
  const response = await api.get(`/public/shops?page=${page}&limit=${limit}`);
  return response.data;
};

export const getPublicProducts = async () => {
  try {
    const response = await api.get('/public/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching public products:', error);
    return { success: false, products: [] };
  }
};

export const getPublicShopDetails = async (id: string) => {
  const response = await api.get(`/public/shops/${id}`);
  return response.data;
};

export const getPublicProductDetails = async (id: string) => {
  try {
    const response = await api.get(`/public/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public product details:', error);
    return { success: false, message: 'Failed to fetch product details' };
  }
};

export const getPublicRightSidebarNews = async () => {
  try {
    const response = await api.get('/public/right-sidebar-news');
    return response.data;
  } catch (error) {
    console.error('Error fetching right sidebar news:', error);
    return { success: false, data: [] };
  }
};

