import axios from 'axios'

const API_URL = 'http://localhost:8000'

export default {
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/api-token-auth/`, {
        username,
        password
      })
      return response.data
    } catch (error) {
      console.error('Erro no serviço de login:', error)
      throw error
    }
  },

  async logout() {
    try {
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    } catch (error) {
      console.error('Erro no serviço de logout:', error)
      throw error
    }
  },

  async checkToken() {
    const user = JSON.parse(localStorage.getItem('user'))
    
    if (!user || !user.token) {
      return false
    }
    
    try {
      const response = await axios.get(`${API_URL}/verify-token/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      })
      
      return response.status === 200
    } catch (error) {
      console.error('Token inválido ou expirado:', error)
      return false
    }
  },

  async getUser() {
    return await axios.get('/api/user/me/') // Ajuste para o endpoint correto
  }
}