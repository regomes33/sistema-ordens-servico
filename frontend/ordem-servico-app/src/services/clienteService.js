import api from './api'
import { logger } from '@/utils/logger'

export default {
  async buscarTodos() {
    try {
      const response = await api.get('clientes/');
      return response.data;
    } catch (error) {
      logger.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  async buscarPorId(id) {
    return api.get(`clientes/${id}/`);
  },

  async criar(cliente) {
    try {
      logger.info('Dados do cliente a serem enviados:', cliente);
      const response = await api.post('clientes/', cliente);
      return response;
    } catch (error) {
      logger.error('Erro ao criar cliente:', error);
      if (error.response) {
        logger.error('Detalhes do erro:', error.response.data);
      }
      throw error;
    }
  },

  async atualizar(id, cliente) {
    return api.put(`clientes/${id}/`, cliente);
  },

  async deletar(id) {
    return api.delete(`clientes/${id}/`);
  }
}