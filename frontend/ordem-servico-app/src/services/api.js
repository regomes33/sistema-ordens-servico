import axios from 'axios';

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
      // >>>>> VOCÊ ESTÁ FAZENDO ALGO COM 'response' AQUI? <<<<<
      // Por exemplo, você está retornando 'response.data.resumo' em vez de 'response'?
      // Ou modificando response.data?
      console.log("AXIOS INTERCEPTOR RESPONSE - Success:", response); // Adicione log aqui
      return response; // << Deve retornar a response completa (ou response.data se for padrão)
  },
  error => {
      console.error("AXIOS INTERCEPTOR RESPONSE - Error:", error); // Adicione log aqui
      // ... tratamento de erro ...
      return Promise.reject(error);
  }
);

export default api;