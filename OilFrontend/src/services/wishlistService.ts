import api from './api';

export interface WishlistItemInput {
  id: string;
  name: string;
  brand?: string;
  variant?: string;
  price: number;
  image?: string;
}

export const addToWishlistAPI = async (item: WishlistItemInput) => {
  try {
    const response = await api.post('/wishlist/add', item);
    return response.data;
  } catch (error: any) {
    console.error('Error adding to wishlist API:', error);
    return { success: false, message: error.response?.data?.message || 'Error adding to wishlist' };
  }
};

export const getWishlistAPI = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return { success: false, message: error.response?.data?.message || 'Error fetching wishlist' };
  }
};

export const removeFromWishlistAPI = async (id: string) => {
  try {
    const response = await api.post('/wishlist/remove', { id });
    return response.data;
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return { success: false, message: error.response?.data?.message || 'Error removing from wishlist' };
  }
};
