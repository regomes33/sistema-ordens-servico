import ordemServicoService from '@/services/ordemServicoService';
import router from '@/router';
import axios from 'axios';

export default {
  namespaced: true,
  
  state: {
    ordensServico: [],
    ordemAtual: null,
    loading: false,
    error: null,
    filtros: {
      status: null,
      cliente: null,
      tipoServico: null
    },
    ordens: {
      data: [],
      resumo: {
        total_ordens: 0,
        valor_total: 0,
        media_valor: 0
      }
    }
  },
  
  getters: {
    allOrdensServico: state => state.ordensServico,
    ordemServicoById: state => id => state.ordensServico.find(o => o.id === parseInt(id)),
    ordensServicoPorStatus: state => status => 
      state.ordensServico.filter(o => o.status === status),
    filtros: state => state.filtros,
    ordensFormatadas: state => {
      return state.ordensServico.map(ordem => ({
        ...ordem,
        clienteNome: ordem.cliente.nome
      }))
    },
    getOrdemById: (state) => (id) => {
      return state.ordensServico.find(ordem => ordem.id === parseInt(id))
    },
    contadores: (state) => {
      return {
        orcamentos: state.ordensServico.filter(o => o.status === 'orcamento').length,
        aprovados: state.ordensServico.filter(o => o.status === 'aprovado').length,
        emAndamento: state.ordensServico.filter(o => o.status === 'em_andamento').length,
        concluidos: state.ordensServico.filter(o => o.status === 'concluido').length
      }
    }
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_ORDENS(state, response) {
      state.ordens = {
        data: Array.isArray(response) ? response : [],
        resumo: response.resumo || {
          total_ordens: 0,
          valor_total: 0,
          media_valor: 0
        }
      }
    },
    SET_ORDEM(state, ordem) {
      state.ordemAtual = ordem;
    },
    ADD_ORDEM(state, ordem) {
      state.ordensServico.push(ordem);
    },
    UPDATE_ORDEM_STATUS(state, { id, status }) {
      const ordem = state.ordensServico.find(o => o.id === id);
      if (ordem) {
        ordem.status = status;
      }
      if (state.ordemAtual && state.ordemAtual.id === id) {
        state.ordemAtual.status = status;
      }
    },
    DELETE_ORDEM_SERVICO(state, id) {
      state.ordensServico = state.ordensServico.filter(o => o.id !== id);
    },
    SET_FILTROS(state, filtros) {
      state.filtros = { ...state.filtros, ...filtros };
    },
    SET_ORDENS_SERVICO(state, ordens) {
      console.log('Mutation SET_ORDENS_SERVICO:', ordens) // Debug
      state.ordensServico = ordens;
    },
    ADD_ORDEM_SERVICO(state, ordem) {
      state.ordensServico.unshift(ordem);
    },
    UPDATE_ORDEM_SERVICO(state, ordem) {
      const index = state.ordensServico.findIndex(o => o.id === ordem.id);
      if (index !== -1) {
        // Substitui a ordem antiga pela nova mantendo a reatividade
        state.ordensServico.splice(index, 1, ordem);
      }
      // Se esta é a ordem atual, atualiza também
      if (state.ordemAtual && state.ordemAtual.id === ordem.id) {
        state.ordemAtual = ordem;
      }
    },
    SET_ORDEM_ATUAL(state, ordem) {
      state.ordemAtual = ordem;
    }
  },
  
  actions: {
    async fetchOrdensServico({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await ordemServicoService.listar();
        console.log('Resposta da API:', response); // Debug
        console.log('Dados recebidos:', response.data); // Debug
        commit('SET_ORDENS_SERVICO', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro na action fetchOrdensServico:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchOrdemServico({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const response = await ordemServicoService.buscarPorId(id);
        commit('SET_ORDEM_ATUAL', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createOrdemServico({ commit, dispatch }, ordem) {
      try {
        const response = await ordemServicoService.criar(ordem);
        await dispatch('fetchOrdensServico');
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    
    async updateOrdemServico({ commit }, { id, data }) {
      commit('SET_LOADING', true);
      try {
        console.log('Dados para atualização:', { id, data });
        // Using the service method instead of direct axios call
        const response = await ordemServicoService.update(id, data);
        
        commit('UPDATE_ORDEM_SERVICO', response.data);
        
        if (data.status) {
          commit('UPDATE_ORDEM_STATUS', { 
            id: id, 
            status: data.status 
          });
        }
        
        return response.data;
      } catch (error) {
        console.error('Erro ao atualizar ordem de serviço:', error);
        commit('SET_ERROR', error.response?.data?.message || 'Erro ao atualizar ordem de serviço');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateStatus({ commit, dispatch }, { id, status }) {
      commit('SET_LOADING', true);
      try {
        console.log('Atualizando status:', { id, status });
        const response = await ordemServicoService.updateStatus(id, status);
        
        // Atualiza tanto a ordem na lista quanto a ordem atual
        commit('UPDATE_ORDEM_STATUS', { id, status });
        
        // Recarrega os dados para garantir sincronização
        await dispatch('fetchOrdemServico', id);
        
        console.log('Status atualizado com sucesso:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Erro ao atualizar status da OS ${id}:`, error);
        commit('SET_ERROR', error.response?.data?.message || 'Erro ao atualizar status');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteOrdemServico({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        await ordemServicoService.deletar(id);
        commit('DELETE_ORDEM_SERVICO', id);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.response?.data || 'Erro ao excluir ordem de serviço');
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async uploadImagem({ commit }, { id, formData }) {
      commit('SET_LOADING', true);
      try {
        const response = await ordemServicoService.uploadImagem(id, formData);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data || 'Erro ao fazer upload da imagem');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateFiltros({ commit, dispatch }, filtros) {
      commit('SET_FILTROS', filtros);
      await dispatch('fetchOrdensServico');
    },
    
    async criar({ commit }, formData) {
      commit('SET_LOADING', true);
      try {
        const response = await ordemServicoService.criar(formData);
        commit('ADD_ORDEM', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async buscarOrdensFiltradas({ commit }, filtros) {
      commit('SET_LOADING', true)
      try {
        const response = await ordemServicoService.buscarComFiltros(filtros)
        commit('SET_ORDENS_SERVICO', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchOrdens({ commit }, params) {
      try {
        const response = await axios.get('/api/relatorios/ordens/', { params })
        commit('SET_ORDENS', response.data)
        return response.data
      } catch (error) {
        // Remover todos os console.log de debug
        // Substituir console.error por:
        logger.error('mensagem de erro específica', error)
        commit('SET_ORDENS', [])
        throw error
      }
    }
  }
};