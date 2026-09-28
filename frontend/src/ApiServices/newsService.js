import api from './axiosConfig';

export const getPublicNews = async () => {
  try {
    const res = await api.get('/public/right-sidebar-news');
    return res;
  } catch (error) {
    console.error('Error fetching public right sidebar news:', error);
    return { success: false, data: [] };
  }
};
