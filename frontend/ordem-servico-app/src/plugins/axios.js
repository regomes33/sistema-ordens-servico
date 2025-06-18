import axios from 'axios';
import { logger } from '@/utils/logger';

// Esta configuração agora funciona PERFEITAMENTE com o proxy do Vite.
// A baseURL relativa '/api/' fará o Vite interceptar e redirecionar a chamada.
const api = axios.create({
  baseURL: '/api/'
});

// Interceptor para adicionar o token (seu código está ótimo)
api.interceptors.request.use(config => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Token ${user.token}`;
      }
    }
  } catch (e) {
    logger.error('Erro ao processar o token no interceptor', e);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Seu interceptor de resposta (bom para debug)
api.interceptors.response.use(
  response => {
    logger.info("AXIOS INTERCEPTOR RESPONSE - Success:", response);
    return response;
  },
  error => {
    logger.error("AXIOS INTERCEPTOR RESPONSE - Error:", error.response || error);
    // ...
    return Promise.reject(error);
  }
);

export default api;