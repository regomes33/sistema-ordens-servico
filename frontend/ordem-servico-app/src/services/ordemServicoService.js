import api from './api'

const BASE_URL = '/api/ordens-servico/'

export default {
  listar() {
    return api.get(BASE_URL)
  },

  buscarComFiltros(filtros) {
    const params = new URLSearchParams()
    
    if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id)
    if (filtros.tipo_servico_id) params.append('tipo_servico_id', filtros.tipo_servico_id)
    if (filtros.status) params.append('status', filtros.status)
    if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio)
    if (filtros.data_fim) params.append('data_fim', filtros.data_fim)

    return api.get(`${BASE_URL}?${params.toString()}`)
  },

  buscarPorId(id) {
    return api.get(`${BASE_URL}${id}/`)
  },

  criar(data) {
    return api.post(BASE_URL, data)
  },

  atualizar(id, data) {
    return api.put(`${BASE_URL}${id}/`, data)
  },

  deletar(id) {
    return api.delete(`${BASE_URL}${id}/`)
  },
  
  uploadImagem(id, formData) {
    return api.post(`/ordens-servico/${id}/upload_imagem/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updateStatus(id, status) {
    return api.patch(`/ordens-servico/${id}/`, { status });
  },

  async adicionarImagens(ordemId, formData) {
    return await api.post(`/api/ordens-servico/${ordemId}/imagens/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  async deleteImagem(ordemId, imagemId) {
    return await api.delete(`/api/ordens-servico/${ordemId}/imagens/${imagemId}/`)
  }
}