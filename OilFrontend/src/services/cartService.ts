import api from './api';

export interface CartItemInput {
  id: string;
  name: string;
  brand: string;
  variant: string;
  price: number;
  qty: number;
  image: string;
}

export const addToCartAPI = async (item: CartItemInput) => {
  try {
    const response = await api.post('/cart/add', item);
    return response.data;
  } catch (error: any) {
    console.error('Error adding to cart API:', error);
    return { success: false, message: error.response?.data?.message || 'Error adding to cart' };
  }
};

export const getCartAPI = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return { success: false, message: error.response?.data?.message || 'Error fetching cart' };
  }
};

export const updateCartItemAPI = async (id: string, variant: string, amount: number) => {
  try {
    const response = await api.put('/cart/update', { id, variant, amount });
    return response.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return { success: false, message: error.response?.data?.message || 'Error updating cart item' };
  }
};

export const removeFromCartAPI = async (id: string, variant: string) => {
  try {
    const response = await api.delete('/cart/remove', { data: { id, variant } });
    return response.data;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return { success: false, message: error.response?.data?.message || 'Error removing from cart' };
  }
};
