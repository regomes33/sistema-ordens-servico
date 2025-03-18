import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000'
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
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Se receber um 401, limpa o localStorage e redireciona para login
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    if (error.response) {
      console.error('Erro na requisição:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })
    }
    return Promise.reject(error)
  }
);

export default api;