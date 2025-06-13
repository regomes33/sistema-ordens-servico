import axios from './plugins/axios' // <- Importe sua instância configurada do axios!

// A constante API_URL não é mais necessária se o axios já está configurado.

export default {
  async login(username, password) {
    try {
      // Chamada relativa à baseURL. Se a baseURL é '/api', a chamada final será '/api/token-auth/'
      const response = await axios.post('/token-auth/', {
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
      // AVISO: a linha abaixo pode não ser necessária se você recarregar a página
      // após o logout, pois a instância do axios será recriada.
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
      // Chamada relativa
      const response = await axios.get('/verify-token/', {
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
    // Chamada relativa
    return await axios.get('/user/me/') 
  }
}