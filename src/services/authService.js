import api from '../config/api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login-admin', {
      email,
      password,
    });

    console.log('Login response:', response.data); // Agrega este log para verificar la respuesta del servidor
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Configurar el token en los headers de axios para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
};

// Configurar el token si existe al cargar la aplicación
const token = authService.getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default authService;
