import api from '@/services/api'

const API_URL = '/api/';

// Carregar usuário do localStorage
const user = JSON.parse(localStorage.getItem('user'));
const initialState = user
  ? { status: { loggedIn: true }, user }
  : { status: { loggedIn: false }, user: null };

export default {
  namespaced: true,
  
  state: {
    token: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null,
    user: null,
    loggedIn: false,
    status: ''
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    authStatus: state => state.status,
    currentUser: state => state.user
  },
  
  mutations: {
    LOGIN_REQUEST(state) {
      state.status = 'loading'
      state.loggedIn = false
    },
    
    LOGIN_SUCCESS(state, { token, user }) {
      state.status = 'success'
      state.token = token
      state.user = user
      state.loggedIn = true
    },
    
    LOGIN_FAILURE(state) {
      state.status = 'error'
      state.token = null
      state.user = null
      state.loggedIn = false
    },
    
    LOGOUT(state) {
      state.status = ''
      state.token = null
      state.user = null
      state.loggedIn = false
    },
    
    SET_TOKEN(state, token) {
      state.token = token
    },
    
    SET_USER(state, user) {
      state.user = user
    },
    
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await api.post('api-token-auth/', credentials)
        const { token } = response.data
        
        const userData = {
          token,
          username: credentials.username
        }
        
        // Salva no localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        
        commit('SET_TOKEN', token)
        commit('SET_USER', { username: credentials.username })
        
        return response
      } catch (error) {
        console.error('Erro no login:', error)
        throw error
      }
    },
    
    logout({ commit }) {
      localStorage.removeItem('user')
      commit('CLEAR_AUTH')
    },
    
    checkAuth({ commit }) {
      const userData = localStorage.getItem('user')
      if (userData) {
        const { token, username } = JSON.parse(userData)
        commit('SET_TOKEN', token)
        commit('SET_USER', { username })
      }
    }
  }
};

// Função para obter o token do localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Função para salvar o token no localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Função para remover o token do localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
    return !!getToken();
};