import { logger } from '@/utils/logger'

/**
 * Função auxiliar para obter o cabeçalho de autenticação
 * Retorna o token JWT armazenado no localStorage para autenticação
 */
export default function authHeader() {
  try {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      // Substituir todos os console.warn por:
      logger.warn('mensagem')
      
      // Substituir todos os console.error por:
      logger.error('mensagem', error)
      return {};
    }
    
    const user = JSON.parse(userStr);
    
    if (!user) {
      console.warn('authHeader: Falha ao analisar dados do usuário do localStorage');
      return {};
    }
    
    if (!user.token) {
      console.warn('authHeader: Token não encontrado nos dados do usuário', user);
      return {};
    }
    
    console.log('authHeader: Token encontrado e será usado nas requisições');
    
    // Para autenticação com Token (DRF default)
    return { 'Authorization': `Token ${user.token}` };
    
    // Para JWT, use isso:
    // return { 'Authorization': `Bearer ${user.token}` };
  } catch (error) {
    console.error('authHeader: Erro ao processar cabeçalho de autenticação', error);
    return {};
  }
}