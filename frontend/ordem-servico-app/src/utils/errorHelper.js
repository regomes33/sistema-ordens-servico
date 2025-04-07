/**
 * Formata uma variedade de erros em uma string legível para o usuário.
 * Tenta extrair a mensagem mais específica possível, começando por respostas de API (Axios).
 *
 * @param {any} error O objeto de erro recebido (pode ser de Axios, JS padrão, ou uma string).
 * @returns {string} Uma mensagem de erro formatada e amigável.
 */
export function formatarErro(error) {
    // 1. Log do erro original para depuração no console do desenvolvedor
    console.error("formatarErro - Erro original recebido:", error);
  
    // 2. Tentar extrair de 'error.response.data' (Comum em Axios quando o servidor respondeu com erro)
    if (error && error.response && error.response.data) {
      const data = error.response.data;
  
      // Se a resposta 'data' for uma string simples (e não vazia)
      if (typeof data === 'string' && data.trim() !== '') {
        return data.trim();
      }
  
      // Se tiver uma propriedade 'message' (Padrão comum em muitas APIs)
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
  
      // Se tiver uma propriedade 'error' (Outro padrão comum)
      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
  
      // Tentar extrair erros de validação (Ex: Laravel, NestJS - pega a 1ª msg do 1º campo)
      if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (Array.isArray(data.errors[firstErrorKey]) && data.errors[firstErrorKey].length > 0) {
          return data.errors[firstErrorKey][0]; // Retorna a primeira mensagem do primeiro erro
        }
      }
  
      // Se 'data' for um objeto, mas não se encaixa nos padrões acima, tentar converter para string (último recurso para 'data')
       if (typeof data === 'object') {
           try {
               const jsonData = JSON.stringify(data);
               // Evitar retornar "{}" vazio, não é útil para o usuário
               if (jsonData !== '{}') return `Erro do servidor: ${jsonData}`;
           } catch (e) { /* Ignora erro de stringify se ocorrer */ }
       }
    }
  
    // 3. Tentar extrair de 'error.message' (Erro JS padrão ou erro de rede Axios sem resposta do servidor)
    if (error && error.message && typeof error.message === 'string') {
      // Você pode querer tratar mensagens específicas de rede aqui, se desejar
      if (error.message.toLowerCase().includes('network error')) {
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      if (error.message.toLowerCase().includes('timeout')) {
          return 'A requisição demorou muito para responder (timeout). Tente novamente.';
      }
      return error.message; // Retorna a mensagem de erro JS padrão
    }
  
    // 4. Se o próprio 'error' for uma string (e não vazia)
    if (typeof error === 'string' && error.trim() !== '') {
      return error.trim();
    }
  
    // 5. Fallback genérico se absolutamente nada mais funcionar
    return 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
  }
  
  // Você pode adicionar outras funções utilitárias relacionadas a erros aqui, se necessário.
  // Exemplo:
  // export function logErrorToServer(error) {
  //   // Lógica para enviar o erro para um serviço de logging externo (Sentry, LogRocket, etc.)
  // }