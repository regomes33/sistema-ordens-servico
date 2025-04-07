import api from './api'

export default {
  async buscarTodos() { // Renomeado de listar para buscarTodos? Mantenha consistência.
    try {
      // Use caminho relativo e adicione barra final
      const response = await api.get('clientes/');
      // A resposta já deve vir do interceptor, não precisa checar Array.isArray geralmente
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      // Retorne o erro ou lance-o para ser tratado onde a função for chamada
      throw error; // Lançar o erro é geralmente melhor para o Vuex tratar
      // return []; // Evite retornar array vazio em caso de erro, dificulta saber o que aconteceu
    }
  },

  /* async listar() {
    return axios.get(`${API_URL}/clientes/`)
  }, */

  async buscarPorId(id) {
    return api.get(`clientes/${id}/`);
  },

  async criar(cliente) {
    try {
      console.log('Dados do cliente a serem enviados:', cliente); // Log completo
      // Use caminho relativo
      const response = await api.post('clientes/', cliente); // Envie o objeto cliente diretamente
      return response;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
      throw error;
    }
  },

  async atualizar(id, cliente) {
    // Use caminho relativo
    return api.put(`clientes/${id}/`, cliente); // Envie o objeto cliente
  },
  async deletar(id) {
    // Use caminho relativo
    return api.delete(`clientes/${id}/`);
  }
}