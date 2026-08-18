import api from './axiosConfig';

export const reviewService = {
  submitReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response;
    } catch (error) {
      console.error('Error in submitReview service:', error);
      throw error;
    }
  },

  getShopReviews: async (vendorId) => {
    try {
      const response = await api.get(`/reviews/shop/${vendorId}`);
      return response;
    } catch (error) {
      console.error('Error in getShopReviews service:', error);
      throw error;
    }
  }
};
