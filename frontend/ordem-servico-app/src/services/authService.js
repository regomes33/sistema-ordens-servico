// Importa sua instância configurada do axios
import axios from './plugins/axios' 

export default {
  /**
   * Realiza o login do usuário e, se bem-sucedido, armazena o token
   * para ser usado em requisições futuras.
   */
  async login(username, password) {
    try {
      // CORREÇÃO: A URL correta, conforme seu urls.py, é /api/api-token-auth/
      const response = await axios.post('api-token-auth/', {
        username,
        password
      });

      // APRIMORAMENTO: Se o login for bem-sucedido, armazene os dados e configure o token.
      if (response.data && response.data.token) {
        // Armazena os dados do usuário (incluindo o token) no localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Define o cabeçalho de autorização padrão para todas as futuras requisições do axios
        axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      // Limpa qualquer estado de login antigo em caso de falha
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      throw error;
    }
  },

  /**
   * Realiza o logout do usuário, limpando o token do localStorage e dos
   * cabeçalhos padrão do axios.
   */
  async logout() {
    try {
      localStorage.removeItem('user');
      
      // Essencial: remove o cabeçalho de autorização para que futuras
      // instâncias da aplicação (sem recarregar a página) não usem o token antigo.
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Erro no serviço de logout:', error);
      throw error;
    }
  },

  /**
   * Verifica se o token armazenado ainda é válido tentando acessar
   * um endpoint protegido.
   */
  async checkToken() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return false;
    }
    
    const user = JSON.parse(userStr);
    if (!user || !user.token) {
      return false;
    }
    
    try {
      // CORREÇÃO: Usamos um endpoint real e protegido (/api/user/me/) para validar o token.
      // A chamada a um endpoint inexistente como '/verify-token/' sempre falhará.
      // Não é necessário passar o header aqui, pois o interceptor ou a função de login
      // já devem ter configurado o cabeçalho padrão do axios.
      const response = await axios.get('/api/user/me/');
      
      return response.status === 200;
    } catch (error) {
      console.error('Token inválido ou expirado:', error);
      // Se o token for inválido, é uma boa prática fazer o logout para limpar o estado.
      this.logout();
      return false;
    }
  },

  /**
   * Busca os dados do usuário logado.
   */
  async getUser() {
    // CORREÇÃO: A URL correta é /api/user/me/
    return await axios.get('/api/user/me/');
  }
}