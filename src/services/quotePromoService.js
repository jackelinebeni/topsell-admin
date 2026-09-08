import api from '../config/api';

const quotePromoService = {
  get: async () => {
    const response = await api.get('/api/quotes/admin/promo');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/api/quotes/admin/promo', data);
    return response.data;
  },
};

export default quotePromoService;
