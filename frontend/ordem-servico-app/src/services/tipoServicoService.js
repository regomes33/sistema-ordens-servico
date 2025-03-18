import axios from '@/plugins/axios'

const API_URL = '/api'

export default {
  async buscarTodos() {
    try {
      const response = await axios.get('/tipos-servico')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error)
      return []
    }
  },

  get(id) {
    return axios.get(`${API_URL}/tipos-servico/${id}/`)
  },

  criar(data) {
    return axios.post(`${API_URL}/tipos-servico/`, data)
  },

  atualizar(id, data) {
    return axios.put(`${API_URL}/tipos-servico/${id}/`, data)
  },

  deletar(id) {
    return axios.delete(`${API_URL}/tipos-servico/${id}/`)
  }
}