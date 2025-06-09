import axios from 'axios';
import { logger } from '@/utils/logger';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user && user.token) {
    config.headers.Authorization = `Token ${user.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  response => {
      logger.info("AXIOS INTERCEPTOR RESPONSE - Success:", response);
      return response;
  },
  error => {
      logger.info("AXIOS INTERCEPTOR RESPONSE - Error:", error);
      // ... tratamento de erro ...
      return Promise.reject(error);
  }
);

export default api;