import api from '../config/api';

const nosotrosService = {
  get: async () => {
    const response = await api.get('/api/pages/about');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/api/pages/about/admin', data);
    return response.data;
  },
};

export default nosotrosService;
