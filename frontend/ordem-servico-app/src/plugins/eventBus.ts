import mitt from 'mitt';
import type { Emitter } from 'mitt'; // <-- 'Emitter' importado como um tipo

// 1. Defina seus eventos e os tipos de dados que eles carregam
type Events = {
  'usuario:login': { id: number; nome: string };
  'notificacao:mostrar': { mensagem: string };
  'evento:sem-dados': void; // Para eventos sem payload
  'show-message': { text: string; color?: string; timeout?: number };
  // Adicione outros eventos aqui
};

// 2. Crie o emitter com os tipos definidos
const emitter: Emitter<Events> = mitt<Events>();

// 3. Exporte o emitter diretamente ou um wrapper simplificado
// O wrapper genérico não é mais necessário, pois o mitt já faz a mágica.
export const eventBus = {
  // O TypeScript agora inferirá o tipo do handler automaticamente!
  on: emitter.on,
  emit: emitter.emit,
  off: emitter.off,
};