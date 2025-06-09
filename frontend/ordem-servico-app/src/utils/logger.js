const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  error(message, error) {
    if (isDevelopment) {
      // Em desenvolvimento, mantém o log no console
      console.error(message, error)
    }
    // Aqui você pode adicionar integração com serviço de monitoramento de erros
    // como Sentry, LogRocket, etc.
  },

  info(message) {
    if (isDevelopment) {
      console.log(message)
    }
  },

  warn(message) {
    if (isDevelopment) {
      console.warn(message)
    }
  }
}