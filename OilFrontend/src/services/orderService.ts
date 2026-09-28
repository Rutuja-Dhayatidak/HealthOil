import api from './api';

export const createRazorpayOrderAPI = async (amount: number) => {
  try {
    const response = await api.post('/orders/create-razorpay-order', { amount });
    return response.data;
  } catch (error: any) {
    console.error('Error creating razorpay order:', error);
    return { success: false, message: error.response?.data?.message || 'Error creating order' };
  }
};

export const verifyPaymentAPI = async (paymentData: any) => {
  try {
    const response = await api.post('/orders/verify-payment', paymentData);
    return response.data;
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return { success: false, message: error.response?.data?.message || 'Error verifying payment' };
  }
};

export const getOrderById = async (orderId?: string | null) => {
  if (!orderId || orderId === 'undefined' || orderId === 'null') {
    return { success: false, message: 'No order ID provided' };
  }
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return { success: false, message: error.response?.data?.message || 'Error fetching order' };
  }
};

export const getMyOrders = async () => {
  try {
    // Assuming the backend has an endpoint for user orders, typical route is /orders or /orders/my-orders
    const response = await api.get('/orders/my-orders'); 
    return response.data;
  } catch (error: any) {
    console.error('Error fetching my orders:', error);
    return { success: false, message: error.response?.data?.message || 'Error fetching orders' };
  }
};
