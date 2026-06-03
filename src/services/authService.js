import api from '../config/api';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // token malformado
  }
};

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
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return null;
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  getToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return token;
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  },
};

// Configurar el token si existe y es válido al cargar la aplicación
const token = authService.getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default authService;
