import api from '../config/api';

const legalService = {
  get: async (slug) => {
    const response = await api.get(`/api/pages/legal/${slug}`);
    return response.data;
  },

  update: async (slug, data) => {
    const response = await api.put(`/api/pages/legal/${slug}/admin`, data);
    return response.data;
  },
};

export default legalService;
