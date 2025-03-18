import axios from 'axios';
import store from './store';
import router from './router';

// Configurar Axios para interceptar respostas
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Interceptor Axios: Token inválido ou expirado');
      
      // Realizar logout
      store.dispatch('auth/logout');
      
      // Redirecionar para login
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Configurar interceptor global para o Axios
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Sessão expirada ou inválida. Redirecionando para login...');
      // Limpar estado de autenticação
      store.dispatch('auth/logout');
      // Redirecionar para a página de login
      router.push('/login');
      
      // Exibir mensagem para o usuário (opcional)
      // Você pode emitir um evento global aqui ou usar uma biblioteca de notificações
    }
    return Promise.reject(error);
  }
); 