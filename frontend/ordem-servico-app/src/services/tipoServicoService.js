import api from './api'
import { logger } from '@/utils/logger'

export default {
  async buscarTodos() {
    try {
      const response = await api.get('tipos-servico/');
      return response.data;
    } catch (error) {
      logger.error('Erro ao buscar tipos de serviço:', error);
      throw error;
    }
  },

  async buscarPorId(id) {
    try {
      const response = await api.get(`tipos-servico/${id}/`);
      return response.data;
    } catch (error) {
      logger.error(`Erro ao buscar tipo de serviço ${id}:`, error);
      throw error;
    }
  },

  async criar(data) {
    try {
      const response = await api.post('tipos-servico/', data);
      return response;
    } catch (error) {
      logger.error('Erro ao criar tipo de serviço:', error);
      throw error;
    }
  },

  async atualizar(id, data) {
    try {
      const response = await api.put(`tipos-servico/${id}/`, data);
      return response;
    } catch (error) {
      logger.error(`Erro ao atualizar tipo de serviço ${id}:`, error);
      throw error;
    }
  }
}