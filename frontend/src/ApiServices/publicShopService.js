import api from './axiosConfig';

export const fetchPublicShops = async () => {
  try {
    const response = await api.get('/public/shops');
    return response;
  } catch (error) {
    console.error('Failed to fetch public shops:', error);
    return { success: false, shops: [] };
  }
};

export const fetchPublicShopDetails = async (id) => {
  try {
    const response = await api.get(`/public/shops/${id}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch shop details:', error);
    return { success: false, shop: null, products: [] };
  }
};

export const fetchPublicProducts = async () => {
  try {
    const response = await api.get('/public/products');
    return response;
  } catch (error) {
    console.error('Failed to fetch public products:', error);
    return { success: false, products: [] };
  }
};
