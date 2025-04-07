import axios from 'axios';
import store from './store';
import router from './router';

// Configurar UM interceptor Axios para respostas
axios.interceptors.response.use(
  response => response, // Handler de sucesso (passa direto)
  error => {
    // Handler de erro
    if (error.response && error.response.status === 401) {
      console.log('Interceptor Axios: Token inválido, expirado ou sessão inválida. Redirecionando...'); // Mensagem unificada

      // Só despacha e redireciona se não estiver já em /login
      // (ou se o estado de autenticação ainda for true, dependendo da sua lógica)
      if (router.currentRoute.value.path !== '/login') {
        // Realizar logout (apenas uma vez)
        store.dispatch('auth/logout');
        // Redirecionar para login (apenas uma vez)
        router.push('/login');
      }
    }
    // Garante que outros erros sejam propagados
    return Promise.reject(error);
  }
);