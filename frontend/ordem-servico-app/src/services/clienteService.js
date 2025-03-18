import axios from '@/plugins/axios'

const API_URL = '/api'

export default {
  async buscarTodos() {
    try {
      const response = await axios.get('/clientes')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    }
  },

  async listar() {
    return axios.get(`${API_URL}/clientes/`)
  },

  async buscarPorId(id) {
    return axios.get(`${API_URL}/clientes/${id}/`)
  },

  async criar(cliente) {
    try {
      console.log('Dados do cliente a serem enviados:', {
        nome: cliente.nome,
        nome_responsavel: cliente.nome_responsavel,
        email: cliente.email,
        telefone: cliente.telefone
      })

      const response = await axios.post(`${API_URL}/clientes/`, {
        nome: cliente.nome,
        nome_responsavel: cliente.nome_responsavel,
        email: cliente.email,
        telefone: cliente.telefone
      })
      
      return response
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data)
      }
      throw error
    }
  },

  async atualizar(id, cliente) {
    return axios.put(`${API_URL}/clientes/${id}/`, {
      nome: cliente.nome,
      nome_responsavel: cliente.nome_responsavel,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco
    })
  },

  async deletar(id) {
    return axios.delete(`${API_URL}/clientes/${id}/`)
  }
}