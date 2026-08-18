import api from './axiosConfig';

export const userService = {
  sendOtp: async (userData) => {
    return await api.post('/auth/send-otp', userData);
  },
  registerUser: async (userData) => {
    return await api.post('/auth/register', userData);
  },
  sendForgotPasswordOtp: async (userData) => {
    return await api.post('/auth/forgot-password-otp', userData);
  },
  resetPassword: async (userData) => {
    return await api.post('/auth/reset-password', userData);
  },
  loginUser: async (userData) => {
    return await api.post('/auth/login', userData);
  },
  getUserProfile: async () => {
    return await api.get('/auth/me');
  }
};
