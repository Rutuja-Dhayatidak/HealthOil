import api from './api';

export const sendOtp = async (email: string) => {
  const response = await api.post('/auth/send-otp', { email });
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const googleLoginUser = async (data: { idToken: string; platform?: string }) => {
  const response = await api.post('/auth/google-login', { platform: 'mobile', ...data });
  return response.data;
};

export const sendForgotPasswordOtp = async (email: string) => {

  const response = await api.post('/auth/forgot-password-otp', { email, platform: 'mobile' });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const deleteAccountAPI = async () => {
  const response = await api.delete('/auth/delete-account');
  return response.data;
};

