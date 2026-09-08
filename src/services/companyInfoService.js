import api from '../config/api';

const companyInfoService = {
  get: async () => {
    const response = await api.get('/api/pages/company-info');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/api/pages/company-info/admin', data);
    return response.data;
  },
};

export default companyInfoService;
