// store/modules/relatorio.js
import { relatorioService } from '../../services/relatorioService';

export default {
  namespaced: true,
  
  state: () => ({
    dadosOrdens: {
      ordens: [],
      resumo: {
        total: 0,
        valorTotal: 0,
        mediaValor: 0,
        statusCount: {}
      }
    },
    dadosClientes: null,
    loading: false,
    error: null,
    relatorioOrdens: null
  }),
  
  mutations: {
    SET_DADOS_ORDENS(state, dados) {
      state.dadosOrdens = dados;
    },
    SET_DADOS_CLIENTES(state, dados) {
      state.dadosClientes = dados;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    setRelatorioOrdens(state, data) {
      state.relatorioOrdens = data;
    }
  },
  
  actions: {
    async fetchRelatorioOrdens({ commit }) {
      try {
        const response = await relatorioService.getRelatorioOrdens();
        commit('SET_DADOS_ORDENS', response);
        commit('setRelatorioOrdens', response);
        return response;
      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
      }
    },
    
    async fetchRelatorioClientes({ commit }, filtros) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const dados = await relatorioService.getRelatorioClientes(filtros);
        commit('SET_DADOS_CLIENTES', dados);
        return dados;
      } catch (error) {
        commit('SET_ERROR', 'Erro ao buscar relatório de clientes');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async exportarPDF({ commit }, { tipo, filtros }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const blob = await relatorioService.exportarPDF(tipo, filtros);
        
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        commit('SET_ERROR', 'Erro ao exportar PDF');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  getters: {
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error,
    getDadosOrdens: state => state.dadosOrdens,
    getDadosClientes: state => state.dadosClientes,
    getRelatorioOrdens: state => state.relatorioOrdens
  }
};