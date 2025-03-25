<template>
  <div class="relatorio-view">
    <v-container>
      <v-card>
        <!-- Título e Busca -->
        <v-card-title>
          Relatórios
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar na tabela" single-line hide-details
            density="compact" variant="underlined" class="mx-4" clearable></v-text-field>
        </v-card-title>

        <!-- Abas -->
        <v-tabs v-model="activeTab" grow>
          <v-tab :value="0">Ordens de Serviço</v-tab>
          <v-tab :value="1">Clientes</v-tab>
        </v-tabs>

        <!-- Filtros -->
        <v-card-text>
          <v-row>
            <!-- Data Início -->
            <v-col cols="12" sm="6" md="3">
              <!-- Usar v-text-field com type="date" é mais simples que v-menu + v-date-picker -->
              <v-text-field v-model="filtros.data_inicio" label="Data Início" type="date" variant="outlined"
                density="compact" clearable></v-text-field>
            </v-col>

            <!-- Data Fim -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="filtros.data_fim" label="Data Fim" type="date" variant="outlined" density="compact"
                clearable></v-text-field>
            </v-col>

            <!-- Status (Filtro de Ordens) -->
            <v-col cols="12" sm="6" md="3" v-if="activeTab === 0">
              <v-select v-model="filtros.status" :items="statusOptions" label="Status" item-title="text"
                item-value="value" multiple chips small-chips closable-chips clearable variant="outlined"
                density="compact"></v-select>
            </v-col>

            <!-- Botão Gerar Relatório -->
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-btn color="primary" block @click="gerarRelatorio" :loading="isLoading" :disabled="isLoading"
                prepend-icon="mdi-sync">
                Gerar Relatório
              </v-btn>
            </v-col>
          </v-row>

          <!-- Filtros adicionais (Tipo Serviço, Cliente) -->
          <v-row>
            <!-- Tipo Serviço (Filtro de Ordens) -->
            <v-col cols="12" md="4" v-if="activeTab === 0">
              <v-autocomplete v-model="filtros.tipo_servico" :items="tiposServicoArray" item-title="nome"
                item-value="id" label="Tipo de Serviço" multiple chips small-chips closable-chips clearable
                variant="outlined" density="compact" :loading="loadingTiposServico"></v-autocomplete>
            </v-col>

            <!-- Cliente (Filtro de Ordens ou Clientes) -->
            <v-col cols="12" md="5"> <!-- Ocupa mais espaço agora -->
              <v-autocomplete v-model="filtros.cliente" :items="clientesArray" item-title="nome" item-value="id"
                label="Cliente" multiple chips small-chips closable-chips clearable variant="outlined" density="compact"
                :loading="loadingClientes"></v-autocomplete>
            </v-col>

            <!-- Botão Exportar -->
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-btn color="success" block @click="exportarPDFHandler" :loading="isLoading" :disabled="isLoading"
                prepend-icon="mdi-file-pdf-box">
                Exportar PDF
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Conteúdo das Abas -->
        <v-window v-model="activeTab">
          <!-- Aba Ordens de Serviço -->
          <v-window-item :value="0">
            <!-- Passa os dados e resumo do store via props -->
            <relatorio-ordens-servico :ordens="getDadosOrdens" :resumo="getResumoOrdens" :loading="isLoading"
              :search="search"></relatorio-ordens-servico>
          </v-window-item>

          <!-- Aba Clientes -->
          <v-window-item :value="1">
            <!-- Assumindo que você tenha um RelatorioClientes.vue -->
            <!-- Ele receberia getDadosClientes e getResumoClientes do store -->
            <relatorio-clientes :clientes="getDadosOrdens" />
          </v-window-item>
        </v-window>

        <!-- Alerta de Erro -->
        <v-alert v-if="hasError" type="error" closable class="ma-3" @input="clearError">
          <!-- CORREÇÃO: Usar o nome correto do getter mapeado -->
          {{ getErrorMessage }}
        </v-alert>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
// Importe os componentes filhos
import RelatorioOrdensServico from '@/components/Relatorio/RelatorioOrdensServico.vue';
import RelatorioClientes from '@/components/Relatorio/RelatorioClientes.vue'; // Crie este se não existir

export default {
  name: 'RelatorioView',
  components: {
    RelatorioOrdensServico,
    RelatorioClientes,
  },
  data() {
    return {
      activeTab: 0, // 0 para Ordens, 1 para Clientes
      search: '', // Busca na tabela (filtragem no frontend)
      // Objeto para os filtros, nomes devem bater com o backend/Vuex action
      filtros: {
        data_inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substr(0, 10), // Default 1 mês atrás
        data_fim: new Date().toISOString().substr(0, 10), // Default hoje
        status: [], // Array para v-select multiple
        tipo_servico: [], // Array para v-select multiple
        cliente: [], // Array para v-autocomplete multiple
      },
      // Opções para o select de status (igual ao backend)
      statusOptions: [

      { text: 'Orçamento',    value: 'ORCAMENTO' },    // <- VALUE corrigido
         { text: 'Aprovado',     value: 'APROVADO' },     // <- VALUE corrigido
         { text: 'Pendente',     value: 'PENDENTE' },     // <- VALUE corrigido
         { text: 'Em Andamento', value: 'EM_ANDAMENTO' }, // <- VALUE corrigido
         { text: 'Concluído',    value: 'CONCLUIDO' },    // <- VALUE corrigido
         { text: 'Cancelado',    value: 'CANCELADO' },    // <- VALUE corrigido
      ],
      loadingTiposServico: false, // Estados de loading para selects
      loadingClientes: false,
    };
  },
  computed: {
    // Mapeia getters do módulo 'relatorio'
    ...mapGetters('relatorio', [
      'isLoading',
      'hasError',
      'getErrorMessage',
      'getDadosOrdens',   // Dados da lista (usado por Ordens e talvez Clientes)
      'getResumoOrdens',  // Resumo (usado por Ordens e talvez Clientes)
    ]),
    // Mapeia getters de outros módulos para os selects
    ...mapGetters('tipoServico', ['getTiposServico']),
    ...mapGetters('cliente', ['clientes']), // Assuming 'clientes' getter exists

    // Arrays para os selects/autocompletes
    tiposServicoArray() {
      // Transforma se necessário, ou usa direto se já for array de objetos com 'nome' e 'id'
      return this.getTiposServico || [];
    },
    clientesArray() {
      // Transforma se necessário, ou usa direto se já for array de objetos com 'nome' e 'id'
      return this.clientes || [];
    },

    // Parâmetros formatados para enviar à API (via action)
    apiParams() {
      return {
        data_inicio: this.filtros.data_inicio,
        data_fim: this.filtros.data_fim,
        // Junta arrays em string separada por vírgula, se não estiverem vazios
        status: this.filtros.status?.length ? this.filtros.status.join(',') : null,
        tipo_servico: this.filtros.tipo_servico?.length ? this.filtros.tipo_servico.join(',') : null,
        cliente: this.filtros.cliente?.length ? this.filtros.cliente.join(',') : null,
      };
    },
  },
  methods: {
    // Mapeia actions dos módulos
    ...mapActions('relatorio', [
      'fetchRelatorioOrdens',
      'fetchRelatorioClientes',
      'exportarRelatorio', // Renomeado no store
      'limparDadosRelatorio'
    ]),
    ...mapActions('tipoServico', ['fetchTiposServico']), // Nome da action no módulo tipoServico
    ...mapActions('cliente', ['fetchClientes']), // Nome da action no módulo cliente

    // Mapeia mutation para limpar erro
    ...mapMutations('relatorio', ['SET_ERRO']),

    async loadInitialData() {
      // Carrega dados para os filtros (clientes, tipos de serviço)
      this.loadingTiposServico = true;
      this.loadingClientes = true;
      try {
        await Promise.all([
          this.fetchTiposServico().catch(e => console.error("Erro ao buscar tipos de serviço:", e)), // Trata erro individualmente
          this.fetchClientes().catch(e => console.error("Erro ao buscar clientes:", e))
        ]);
        // Após carregar filtros, busca relatório inicial da primeira aba
        await this.gerarRelatorio();
      } catch (error) {
        // Erro geral já logado nas actions individuais
        console.error('Erro ao carregar dados iniciais da view:', error);
      } finally {
        this.loadingTiposServico = false;
        this.loadingClientes = false;
      }
    },

    // Dispara a action correta baseada na aba ativa
    async gerarRelatorio() {
      console.log('[RelatorioView] Verificando apiParams:', this.apiParams);
      try {
        if (this.activeTab === 0) { // Aba Ordens
          await this.fetchRelatorioOrdens(this.apiParams);
        } else if (this.activeTab === 1) { // Aba Clientes
          // Ajusta params se necessário para clientes (backend pode esperar nomes diferentes)
          const clienteParams = { ...this.apiParams };
          // Remove filtros não aplicáveis a clientes, se houver
          delete clienteParams.status;
          delete clienteParams.tipo_servico;
          await this.fetchRelatorioClientes(clienteParams);
        }
      } catch (error) {
        // O erro já é tratado e armazenado no Vuex state pela action
        // this.$toast?.error('Falha ao gerar relatório.'); // Opcional: feedback adicional
        console.error('Falha capturada em gerarRelatorio na view:', error);
        console.error('[RelatorioView] Falha capturada em gerarRelatorio:', error);
      }
    },

    // Chama a action de exportar PDF
    async exportarPDFHandler() {
      try {
        const tipos = ['ordens', 'clientes']; // Nomes dos tipos como esperado pela API/action
        const tipo = tipos[this.activeTab];

        // Passa o tipo e os parâmetros formatados para a action
        await this.exportarRelatorio({ tipo: tipo, params: this.apiParams });

        // Sucesso (feedback opcional, action já faz o download)
        // this.$toast?.success('Download do relatório iniciado.');

      } catch (error) {
        // Erro já tratado no Vuex, mas pode dar feedback aqui também
        // O getter 'errorMessage' já terá a mensagem de erro vinda da action
        // this.$toast?.error(this.errorMessage || 'Erro ao exportar PDF.');
        console.error('Falha capturada em exportarPDFHandler na view:', error);
      }
    },
    // Limpa a mensagem de erro no store quando o alerta é fechado
    clearError() {
      this.SET_ERRO(null);
    }
  },
  watch: {
    // Limpa dados e busca relatório ao trocar de aba
    async activeTab(newTab, oldTab) {
      if (newTab !== oldTab) {
        this.search = ''; // Limpa busca da tabela
        // this.limparDadosRelatorio(); // Action do store para limpar dados
        await this.gerarRelatorio(); // Gera relatório para a nova aba
      }
    }
  },
  // Carrega dados dos filtros e relatório inicial ao criar o componente
  created() {
    this.loadInitialData();
  },
};
</script>

<style scoped>
.relatorio-view {
  margin-top: 1rem;
}

.v-card {
  margin-bottom: 1rem;
}

.v-btn {
  text-transform: none;
  /* Evita maiúsculas nos botões */
}

/* Ajuste para alinhar botões com inputs */
.d-flex.align-center {
  align-self: center;
}
</style>