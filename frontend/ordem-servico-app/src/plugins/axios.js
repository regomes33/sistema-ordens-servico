import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Token ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpar dados do usuário
      localStorage.removeItem('user');
      
      // Redirecionar para login mantendo a URL original como redirect
      const currentPath = router.currentRoute.value.fullPath;
      router.push({
        name: 'Login',
        query: { redirect: currentPath }
      });
    }

    return Promise.reject(error);
  }
);

export default api;