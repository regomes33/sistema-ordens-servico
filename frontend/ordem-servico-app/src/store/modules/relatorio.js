// src/store/modules/relatorio.js
import axios from '@/plugins/axios'; // Use a instância configurada
import api from '@/services/api';
import { formatarErro } from '@/utils/errorHelper';
const state = {
  // Estado para Ordens
  dadosOrdens: [],
  resumoOrdens: {},
  // Estado para Clientes (ADICIONAR ESTES)
  dadosClientes: [],
  resumoClientes: {}, // Se houver resumo específico para clientes
  // Estado compartilhado
  isLoading: false,
  error: null,
  // Paginação/Total (Pode precisar ajustar como isso é armazenado/recuperado da API)
  totalOrdens: 0,
  totalClientes: 0,
};

const getters = {
  // Getters de Ordens
  getDadosOrdens: (state) => state.dadosOrdens,
  getResumoOrdens: (state) => state.resumoOrdens,
  getTotalOrdens: (state) => state.totalOrdens, // Getter para total
  // Getters de Clientes (ADICIONAR ESTES)
  getDadosClientes: (state) => state.dadosClientes,
  getResumoClientes: (state) => state.resumoClientes,
  getTotalClientes: (state) => state.totalClientes, // Getter para total
  // Getters compartilhados
  isLoading: (state) => state.isLoading,
  hasError: (state) => !!state.error,
  getErrorMessage: (state) => state.error,
};

const mutations = {
  SET_CARREGANDO: (state, payload) => { state.isLoading = payload; },
  SET_ERRO: (state, payload) => { state.error = payload ? formatarErro(payload) : null; },
  // Mutations para Ordens
  SET_RELATORIO_ORDENS: (state, payload) => { // payload é o objeto { ordens: [...], resumo: ... }
    console.log("MUTATION ORDENS - Payload recebido:", JSON.stringify(payload)); // Mantenha este log
    const ordensArray = payload?.ordens || []; // << GARANTA que está acessando .ordens
    console.log("MUTATION ORDENS - Array a ser definido:", JSON.stringify(ordensArray)); // Mantenha este log
    state.dadosOrdens = ordensArray;
    state.resumoOrdens = payload?.resumo || {};
    state.totalOrdens = payload?.total ?? (Array.isArray(ordensArray) ? ordensArray.length : 0); // Use o total ou o length
    console.log("MUTATION ORDENS - state.dadosOrdens APÓS:", JSON.stringify(state.dadosOrdens)); // Mantenha este log
  },
  // Mutations para Clientes (ADICIONAR ESTAS)
  SET_RELATORIO_CLIENTES: (state, payload) => {
    console.log("MUTATION - Payload recebido:", JSON.stringify(payload));
    console.log("MUTATION - TIPO do payload:", typeof payload);
    console.log("MUTATION - Chaves do payload:", Object.keys(payload || {}));

    // CORREÇÃO PRINCIPAL: Use payload.dados aqui!
    console.log("MUTATION - Acessando payload.dados:", JSON.stringify(payload?.dados)); // << Mude para .dados
    const dataArray = payload?.dados || []; // << Mude para .dados

    console.log("MUTATION - Array a ser definido:", JSON.stringify(dataArray));
    state.dadosClientes = dataArray;
    state.resumoClientes = payload?.resumo || {};
    state.totalClientes = payload?.total || 0; // Total continua correto
    console.log("MUTATION - state.dadosClientes APÓS:", JSON.stringify(state.dadosClientes));
  },
  LIMPAR_DADOS_RELATORIO: (state) => {
    state.dadosOrdens = [];
    state.resumoOrdens = {};
    state.dadosClientes = [];
    state.resumoClientes = {};
    state.error = null;
    state.totalOrdens = 0;
    state.totalClientes = 0;
  },
};

const actions = {
  async fetchRelatorioOrdens({ commit }, params) {
    console.log('Buscando relatório de ordens com params:', params);
    commit('SET_CARREGANDO', true);
    commit('SET_ERRO', null);
    try {
      const response = await api.get('/relatorios/ordens/', { params });

      // CORREÇÃO: Passe response.data diretamente.
      // A mutation SET_RELATORIO_ORDENS já sabe como extrair 'ordens', 'resumo', 'total' do payload.
      console.log("ACTION fetchRelatorioOrdens - response.data a ser comitado:", JSON.stringify(response.data));
      commit('SET_RELATORIO_ORDENS', response.data); // << SIMPLESMENTE PASSE response.data

    } catch (error) {
      console.error('Erro ao buscar relatório de ordens:', error);
      commit('SET_ERRO', error);
    } finally {
      commit('SET_CARREGANDO', false);
    }
  },

  async fetchRelatorioClientes({ commit }, params) {
    console.log('Buscando relatório de clientes com params:', params);
    commit('SET_CARREGANDO', true);
    commit('SET_ERRO', null);
    try {
      // Assumindo que a API retorna { data: [...], resumo: {...}, total: X }
      const response = await api.get('/relatorios/clientes/', { params });
      commit('SET_RELATORIO_CLIENTES', {
        dados: response.data.data,   // Ajuste conforme estrutura da sua API
        resumo: response.data.resumo, // Ajuste conforme estrutura da sua API
        total: response.data.total    // Ajuste conforme estrutura da sua API
      });
    } catch (error) {
      console.error('Erro ao buscar relatório de clientes:', error);
      commit('SET_ERRO', error);
    } finally {
      commit('SET_CARREGANDO', false);
    }
  },

  async exportarRelatorio({ commit }, { tipo, params }) {
    console.log(`Exportando relatório ${tipo} com params:`, params);
    commit('SET_CARREGANDO', true); // Ou um estado de loading específico para exportação
    commit('SET_ERRO', null);
    try {
      const response = await api.get(`/relatorios/exportar/${tipo}`, {
        params,
        responseType: 'blob', // Importante para download de arquivos
      });

      // Lógica para iniciar o download do Blob (pode variar)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const contentDisposition = response.headers['content-disposition'];
      let filename = `relatorio_${tipo}.pdf`; // Default
      if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch.length > 1) {
              filename = filenameMatch[1];
          }
      }
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Erro ao exportar relatório ${tipo}:`, error);
      // Tenta ler a mensagem de erro se for um JSON no blob
      if (error.response && error.response.data instanceof Blob && error.response.data.type === "application/json") {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText);
          commit('SET_ERRO', errorJson.message || errorText);
        } catch (parseError) {
          commit('SET_ERRO', errorText); // Define o texto bruto se não for JSON válido
        }
      } else {
         commit('SET_ERRO', error); // Define o erro padrão
      }
    } finally {
      commit('SET_CARREGANDO', false);
    }
  },

  limparDadosRelatorio({ commit }) {
    commit('LIMPAR_DADOS_RELATORIO');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};