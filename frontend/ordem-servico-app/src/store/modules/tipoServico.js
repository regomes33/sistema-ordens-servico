import tipoServicoService from '@/services/tipoServicoService';

export default {
  namespaced: true,
  
  state: {
    tiposServico: [],
    tipoServico: null,
    loading: false,
    error: null
  },
  
  getters: {
    allTiposServico: state => state.tiposServico,
    tipoServicoById: state => id => state.tiposServico.find(t => t.id === parseInt(id)),
    getTiposServico: state => state.tiposServico || []
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_TIPOS_SERVICO(state, tipos) {
      state.tiposServico = Array.isArray(tipos) ? tipos : [];
    },
    SET_TIPO_SERVICO(state, tipoServico) {
      state.tipoServico = tipoServico;
    },
    ADD_TIPO_SERVICO(state, tipoServico) {
      state.tiposServico.push(tipoServico);
    },
    UPDATE_TIPO_SERVICO(state, tipoServico) {
      const index = state.tiposServico.findIndex(t => t.id === tipoServico.id);
      if (index !== -1) {
        state.tiposServico.splice(index, 1, tipoServico);
      }
    },
    DELETE_TIPO_SERVICO(state, id) {
      state.tiposServico = state.tiposServico.filter(t => t.id !== id);
    }
  },
  
  actions: {
    async fetchTiposServico({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const tipos = await tipoServicoService.buscarTodos();
        commit('SET_TIPOS_SERVICO', tipos);
      } catch (error) {
        commit('SET_ERROR', 'Erro ao carregar tipos de serviço');
        commit('SET_TIPOS_SERVICO', []);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchTipoServico({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const response = await tipoServicoService.get(id);
        commit('SET_TIPO_SERVICO', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data || 'Erro ao buscar tipo de serviço');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createTipoServico({ commit }, tipoServico) {
      try {
        const response = await tipoServicoService.criar(tipoServico);
        commit('ADD_TIPO_SERVICO', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro ao criar tipo de serviço:', error);
        throw error;
      }
    },
    
    async updateTipoServico({ commit }, tipoServico) {
      try {
        const response = await tipoServicoService.atualizar(tipoServico.id, tipoServico);
        commit('UPDATE_TIPO_SERVICO', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro ao atualizar tipo de serviço:', error);
        throw error;
      }
    },
    
    async deleteTipoServico({ commit }, id) {
      try {
        await tipoServicoService.deletar(id);
        commit('DELETE_TIPO_SERVICO', id);
      } catch (error) {
        console.error('Erro ao deletar tipo de serviço:', error);
        throw error;
      }
    }
  }
};