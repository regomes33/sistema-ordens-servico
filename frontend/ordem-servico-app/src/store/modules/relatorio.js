// src/store/modules/relatorio.js
import axios from '@/plugins/axios'; // Use a instância configurada
// Ou importe o service: import { relatorioService } from '@/services/relatorioService';

const state = {
  dadosRelatorio: [], // Para a lista (ordens ou clientes)
  resumoRelatorio: {}, // Para o objeto de resumo
  carregando: false,
  erro: null,
  // metadados não parece ser usado pela API de relatório, pode remover se não for usar
};

const getters = {
  isLoading: (state) => state.carregando,
  hasError: (state) => !!state.erro,
  getErrorMessage: (state) => state.erro,
  // Getters específicos para os dados e resumo
  getDadosOrdens: (state) => state.dadosRelatorio, // Renomear se precisar diferenciar
  getResumoOrdens: (state) => state.resumoRelatorio, // Renomear se precisar diferenciar
  // Se tiver relatorio de clientes, pode ter getters separados ou usar os mesmos
  // getDadosClientes: state => state.dadosRelatorio,
  // getResumoClientes: state => state.resumoRelatorio,
};

const mutations = {
  SET_CARREGANDO(state, status) {
    state.carregando = status;
  },
  SET_ERRO(state, erro) {
    state.erro = erro;
    // Limpa dados ao ocorrer erro
    state.dadosRelatorio = [];
    state.resumoRelatorio = {};
  },
  // Mutation para receber os dados de ordens E o resumo
  SET_RELATORIO_ORDENS(state, payload) {
    console.log("MUTATION: Payload recebido:", JSON.parse(JSON.stringify(payload))); // Log 1: Ver o payload cru
    state.dadosRelatorio = payload.ordens || [];
    state.resumoRelatorio = payload.resumo || {};
    state.erro = null;
    console.log("MUTATION: State.dadosRelatorio após:", JSON.parse(JSON.stringify(state.dadosRelatorio))); // Log 2: Ver o array de ordens
    console.log("MUTATION: State.resumoRelatorio após:", JSON.parse(JSON.stringify(state.resumoRelatorio))); // Log 3: Ver o objeto resumo
    state.dadosRelatorio = payload.ordens || []; // Garante que seja array
    state.resumoRelatorio = payload.resumo || {}; // Garante que seja objeto
    state.erro = null; // Limpa erro em caso de sucesso
  },
  // Mutation separada para clientes, se a estrutura for diferente
  SET_RELATORIO_CLIENTES(state, payload) {
    state.dadosRelatorio = payload.clientes || [];
    state.resumoRelatorio = payload.resumo || {};
    state.erro = null;
  },
  LIMPAR_DADOS(state) {
    state.dadosRelatorio = [];
    state.resumoRelatorio = {};
    state.erro = null;
    state.carregando = false;
  }
};

const actions = {
  // Action para buscar relatório de ordens
  async fetchRelatorioOrdens({ commit }, params) {
    commit('SET_CARREGANDO', true);
    commit('LIMPAR_DADOS');
    try {
      const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      console.log("Buscando relatório de ordens com params:", cleanParams);

      // CORREÇÃO: Remover '/api' inicial
      const response = await axios.get('/relatorios/ordens/', { params: cleanParams });

      commit('SET_RELATORIO_ORDENS', response.data);
      return response.data;
    } catch (error) {
      // Log e tratamento de erro permanecem os mesmos
      console.error('Erro em fetchRelatorioOrdens:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Erro ao buscar relatório de ordens.';
      commit('SET_ERRO', errorMessage);
      throw error;
    } finally {
      commit('SET_CARREGANDO', false);
    }
  },

  // Action para buscar relatório de clientes
  async fetchRelatorioClientes({ commit }, params) {
    commit('SET_CARREGANDO', true);
    commit('LIMPAR_DADOS');
    try {
       const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      console.log("Buscando relatório de clientes com params:", cleanParams);

      // CORREÇÃO: Remover '/api' inicial
      const response = await axios.get('/relatorios/clientes/', { params: cleanParams });

      commit('SET_RELATORIO_CLIENTES', response.data);
      return response.data;
    } catch (error) {
      // Log e tratamento de erro permanecem os mesmos
      console.error('Erro em fetchRelatorioClientes:', error.response?.data || error.message);
       const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Erro ao buscar relatório de clientes.';
      commit('SET_ERRO', errorMessage);
      throw error;
    } finally {
      commit('SET_CARREGANDO', false);
    }
  },

  // Action de exportar
  async exportarRelatorio(context, { tipo, params }) {
     context.commit('SET_CARREGANDO', true);
     try {
       const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
       cleanParams['disposition'] = 'inline'; // Tentar abrir inline
       console.log(`Exportando PDF tipo ${tipo} com params:`, cleanParams);

       // CORREÇÃO: Remover '/api' inicial
       const response = await axios.get(`/relatorios/${tipo}/pdf/`, {
        params: cleanParams,
        responseType: 'blob',
       // headers: { 'Accept': 'application/pdf' }
      });

      // Lógica de download permanece a mesma...
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `relatorio-${tipo}-${new Date().toISOString().slice(0,10)}.pdf`;
      if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
       // Log e tratamento de erro permanecem os mesmos...
      console.error('Erro ao exportar relatório PDF:', error.response || error);
      let errorMessage = 'Não foi possível exportar o relatório PDF.';
      if (error.response && error.response.data instanceof Blob && error.response.data.type === "application/json") {
         try {
           const errorJson = JSON.parse(await error.response.data.text());
           errorMessage = errorJson.detail || errorJson.error || errorMessage;
         } catch (parseError) { /* Ignora erro no parse */ }
      } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
      } else if(error.response?.status === 406) {
        errorMessage = 'Não foi possível exportar o relatório PDF Verifique o Accept.';
      }
       context.commit('SET_ERRO', errorMessage);
      throw new Error(errorMessage);
    } finally {
       context.commit('SET_CARREGANDO', false);
    }
  },

  limparDadosRelatorio({ commit }) {
    commit('LIMPAR_DADOS');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};