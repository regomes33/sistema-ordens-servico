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
    UPDATE_ORDEM(state, ordem) {
      const index = state.ordensServico.findIndex(o => o.id === ordem.id);
      if (index !== -1) {
        state.ordensServico.splice(index, 1, ordem);
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
        state.ordensServico.splice(index, 1, ordem);
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
    
    async updateOrdemServico({ commit, dispatch }, { id, data }) {
      try {
        const response = await ordemServicoService.atualizar(id, data);
        await dispatch('fetchOrdensServico');
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
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
        console.error('Erro ao buscar ordens:', error)
        commit('SET_ORDENS', [])
        throw error
      }
    }
  }
};