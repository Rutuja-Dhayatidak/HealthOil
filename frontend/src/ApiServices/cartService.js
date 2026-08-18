import api from './axiosConfig';

export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addToCartAPI = async (item) => {
  try {
    const response = await api.post('/cart/add', item);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCartItemAPI = async (id, variant, amount) => {
  try {
    const response = await api.put('/cart/update', { id, variant, amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeFromCartAPI = async (id, variant) => {
  try {
    // Axios delete with body requires data config
    const response = await api.delete('/cart/remove', { data: { id, variant } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const mergeCartAPI = async (guestItems) => {
  try {
    const response = await api.post('/cart/merge', { guestItems });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
