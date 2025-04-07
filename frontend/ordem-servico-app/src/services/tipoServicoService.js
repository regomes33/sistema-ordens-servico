import api from './api'

export default {
  async buscarTodos() {
    try {
      // Caminho relativo correto, usando a instância 'api'
      const response = await api.get('tipos-servico/');
      // Retorna os dados diretamente (melhor prática)
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      // Lança o erro para ser tratado no Vuex store
      throw error;
    }
  },

  // Renomeado para consistência e corrigido
  async buscarPorId(id) {
    try {
      // Usa 'api' e caminho relativo
      const response = await api.get(`tipos-servico/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tipo de serviço ${id}:`, error);
      throw error;
    }
  },

  // Corrigido
  async criar(data) {
    try {
      // Usa 'api' e caminho relativo
      const response = await api.post('tipos-servico/', data);
      return response; // Pode retornar response.data se preferir
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error);
      throw error;
    }
  },

  // Corrigido
  async atualizar(id, data) {
    try {
      // Usa 'api' e caminho relativo
      const response = await api.put(`tipos-servico/${id}/`, data);
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar tipo de serviço ${id}:`, error);
      throw error;
    }
  },

  // Corrigido
  async deletar(id) {
    try {
      // Usa 'api' e caminho relativo
      const response = await api.delete(`tipos-servico/${id}/`);
      return response;
    } catch (error) {
      console.error(`Erro ao deletar tipo de serviço ${id}:`, error);
      throw error;
    }
  }
}