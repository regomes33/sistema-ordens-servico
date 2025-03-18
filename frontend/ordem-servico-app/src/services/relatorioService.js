// services/relatorioService.js
import axios from '@/plugins/axios';
import { getToken } from '@/utils/auth';

const API_URL = 'http://localhost:8000/api';

export const relatorioService = {
  async getRelatorioOrdens() {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/relatorios/ordens/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatório de ordens:', error);
      throw error;
    }
  },
  
  async getRelatorioClientes(filtros = {}) {
    try {
      const response = await axios.get(`${API_URL}/relatorios/clientes/`, { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatório de clientes:', error);
      throw error;
    }
  },
  
  getRelatorioFaturamento(params) {
    return axios.get(`${API_URL}/relatorios/faturamento/`, { params });
  },
  
  async exportarPDF(tipo, filtros = {}) {
    try {
      const response = await axios.get(`${API_URL}/relatorios/${tipo}/pdf/`, {
        params: filtros,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  },
  
  async exportarRelatorio(tipo, params) {
    try {
      const response = await axios.get(`${API_URL}/relatorios/${tipo}/pdf`, {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Criar blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${tipo}-${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw new Error('Não foi possível exportar o relatório');
    }
  }
};