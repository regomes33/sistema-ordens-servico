import clienteService from '@/services/clienteService';

export default {
  namespaced: true,
  
  state: {
    clientes: [],
    clienteAtual: null,
    loading: false,
    error: null
  },
  
  getters: {
    clientes: state => state.clientes || [],
    clienteById: state => id => state.clientes.find(c => c.id === parseInt(id))
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_CLIENTES(state, clientes) {
      state.clientes = Array.isArray(clientes) ? clientes : [];
    },
    SET_CLIENTE(state, cliente) {
      state.clienteAtual = cliente;
    },
    ADD_CLIENTE(state, cliente) {
      state.clientes.unshift(cliente);
    },
    UPDATE_CLIENTE(state, updatedCliente) {
      const index = state.clientes.findIndex(c => c.id === updatedCliente.id);
      if (index !== -1) {
        state.clientes.splice(index, 1, updatedCliente);
      }
    },
    REMOVE_CLIENTE(state, id) {
      state.clientes = state.clientes.filter(c => c.id !== id);
    }
  },
  
  actions: {
    async fetchClientes({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const clientes = await clienteService.buscarTodos();
        commit('SET_CLIENTES', clientes);
      } catch (error) {
        commit('SET_ERROR', 'Erro ao carregar clientes');
        commit('SET_CLIENTES', []);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchCliente({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const response = await clienteService.buscarPorId(id);
        commit('SET_CLIENTE', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data || 'Erro ao buscar cliente');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createCliente({ commit }, cliente) {
      try {
        const response = await clienteService.criar({
          nome: cliente.nome,
          nome_responsavel: cliente.nome_responsavel,
          email: cliente.email,
          telefone: cliente.telefone,
          endereco: cliente.endereco
        });
        commit('ADD_CLIENTE', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      }
    },
    
    async updateCliente({ commit }, clienteData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const updatedCliente = await clienteService.atualizar(clienteData.id, clienteData);
        commit('UPDATE_CLIENTE', updatedCliente);
        return updatedCliente;
      } catch (error) {
        commit('SET_ERROR', error.message);
        console.error('Erro ao atualizar cliente:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteCliente({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        await clienteService.deletar(id);
        commit('REMOVE_CLIENTE', id);
        return id;
      } catch (error) {
        commit('SET_ERROR', error.message);
        console.error('Erro ao excluir cliente:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};