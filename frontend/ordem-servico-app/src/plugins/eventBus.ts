import mitt from 'mitt'

export const eventBus = mitt()

// Tipos de eventos (opcional, se estiver usando TypeScript)
export type Events = {
  'show-message': {
    text: string
    color?: string
    timeout?: number
  }
} 