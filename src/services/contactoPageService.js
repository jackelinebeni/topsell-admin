import api from '../config/api';

const contactoPageService = {
  get: async () => {
    const response = await api.get('/api/pages/contact-info');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/api/pages/contact-info/admin', data);
    return response.data;
  },
};

export default contactoPageService;
