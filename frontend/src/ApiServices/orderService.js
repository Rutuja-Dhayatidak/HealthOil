import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const orderService = {
  createRazorpayOrder: async (amount) => {
    try {
      const res = await axios.post(`${API_URL}/orders/create-razorpay-order`, { amount }, getAuthHeaders());
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  verifyPaymentAndCreateOrders: async (paymentData) => {
    try {
      const res = await axios.post(`${API_URL}/orders/verify-payment`, paymentData, getAuthHeaders());
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  getUserOrders: async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/my-orders`, getAuthHeaders());
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  },

  trackOrder: async (orderId) => {
    try {
      const encodedId = encodeURIComponent(orderId);
      const res = await axios.get(`${API_URL}/orders/track/${encodedId}`, getAuthHeaders());
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : err;
    }
  }
};
