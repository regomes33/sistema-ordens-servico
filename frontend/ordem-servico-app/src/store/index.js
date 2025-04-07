import { createStore } from 'vuex';
import auth from '../utils/auth'; // <-- Caminho incomum para um módulo Vuex
import cliente from './modules/cliente';
import tipoServico from './modules/tipoServico';
import ordemServico from './modules/ordemServico';
import relatorio from './modules/relatorio';

export default createStore({
  modules: {
    auth,
    cliente,
    tipoServico,
    ordemServico,
    relatorio
  }
});