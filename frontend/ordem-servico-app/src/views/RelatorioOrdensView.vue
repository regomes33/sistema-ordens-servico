<template>
  <div class="relatorio-ordens-view">
    <v-container>
      <v-card>
        <!-- Título e Busca -->
        <v-card-title>
          Relatório de Ordens de Serviço
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar na tabela" single-line hide-details
            density="compact" variant="underlined" class="mx-4" clearable></v-text-field>
        </v-card-title>

        <!-- Filtros -->
        <v-card-text>
          <v-row>
            <!-- Data Início -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="filtros.data_inicio" label="Data Início" type="date" variant="outlined"
                density="compact" clearable></v-text-field>
            </v-col>
            <!-- Data Fim -->
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="filtros.data_fim" label="Data Fim" type="date" variant="outlined" density="compact"
                clearable></v-text-field>
            </v-col>
            <!-- Status -->
            <v-col cols="12" sm="6" md="3">
              <v-select v-model="filtros.status" :items="statusOptions" label="Status" item-title="text"
                item-value="value" multiple chips small-chips closable-chips clearable variant="outlined"
                density="compact"></v-select>
            </v-col>
            <!-- Tipo Serviço -->
            <v-col cols="12" md="3">
              <v-autocomplete v-model="filtros.tipo_servico" :items="tiposServicoArray" item-title="nome"
                item-value="id" label="Tipo de Serviço" multiple chips small-chips closable-chips clearable
                variant="outlined" density="compact" :loading="loadingTiposServico"></v-autocomplete>
            </v-col>
          </v-row>

          <!-- Filtro Cliente e Botões -->
          <v-row>
            <!-- Cliente -->
            <v-col cols="12" md="6">
              <v-autocomplete v-model="filtros.cliente" :items="clientesArray" item-title="nome" item-value="id"
                label="Cliente" multiple chips small-chips closable-chips clearable variant="outlined" density="compact"
                :loading="loadingClientes"></v-autocomplete>
            </v-col>

            <!-- Botão Gerar -->
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-btn color="primary" block @click="gerarRelatorio" :loading="isLoading" :disabled="isLoading"
                prepend-icon="mdi-sync">
                Gerar Relatório
              </v-btn>
            </v-col>
            <!-- Botão Exportar -->
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-btn color="success" block @click="exportarPDFHandler" :loading="isLoading"
                :disabled="isLoading || !dadosOrdens.length" prepend-icon="mdi-file-pdf-box">
                Exportar PDF
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Componente Filho para exibir os dados -->
        <relatorio-ordens-servico :ordens="dadosOrdens" :resumo="resumoOrdens" :loading="isLoading" :search="search"
          :total-items="totalOrdens" :items-per-page="itemsPerPage" :current-page="filtros.pagina"
          :current-sort="filtros.ordenacao" @ordenar="handleOrdenarOrdens" @mudar-pagina="handleMudarPaginaOrdens"
          @update:items-per-page="handleItemsPerPageChange" />

        <!-- Alerta de Erro -->
        <v-alert v-if="hasError" type="error" closable class="ma-3" @update:modelValue="clearError">
          {{ getErrorMessage }}
        </v-alert>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import RelatorioOrdensServico from '@/components/Relatorio/RelatorioOrdensServico.vue'; // Verifique o caminho
import { debounce } from 'lodash-es';

export default {
  name: 'RelatorioOrdensView',
  components: {
    RelatorioOrdensServico,
  },
  data() {
    return {
      search: '',
      itemsPerPage: 15, // Defina um valor padrão
      filtros: {
        data_inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substr(0, 10),
        data_fim: new Date().toISOString().substr(0, 10),
        status: [],
        tipo_servico: [],
        cliente: [],
        pagina: 1,
        ordenacao: 'data_criacao', // Ordenação padrão
      },
      statusOptions: [
        { text: 'Orçamento', value: 'ORCAMENTO' },
        { text: 'Aprovado', value: 'APROVADO' },
        { text: 'Pendente', value: 'PENDENTE' },
        { text: 'Em Andamento', value: 'EM_ANDAMENTO' },
        { text: 'Concluído', value: 'CONCLUIDO' },
        { text: 'Cancelado', value: 'CANCELADO' },
      ],
      loadingTiposServico: false,
      loadingClientes: false,
    };
  },
  computed: {
    ...mapGetters('relatorio', {
      isLoading: 'isLoading',
      hasError: 'hasError',
      getErrorMessage: 'getErrorMessage',
      //dadosOrdens: 'getDadosOrdens', // Mapeia getter específico
      resumoOrdens: 'getResumoOrdens', // Mapeia getter específico
      totalOrdens: 'getTotalOrdens',   // Mapeia getter para total
    }),
    dadosOrdens() {
      const data = this.$store.getters['relatorio/getDadosOrdens'];
      console.log("VIEW PAI ORDENS - Computed dadosOrdens:", JSON.stringify(data)); // Log
      return data;
    },
    ...mapGetters('tipoServico', ['getTiposServico']),
    ...mapGetters('cliente', ['clientes']),

    tiposServicoArray() { return this.getTiposServico || []; },
    clientesArray() { return this.clientes || []; },

    // Parâmetros formatados para a API
    apiParams() {
      const params = {
        ...this.filtros,
        itens_por_pagina: this.itemsPerPage,
        // Transforma arrays em strings separadas por vírgula
        status: this.filtros.status?.length ? this.filtros.status.join(',') : null,
        tipo_servico: this.filtros.tipo_servico?.length ? this.filtros.tipo_servico.join(',') : null,
        cliente: this.filtros.cliente?.length ? this.filtros.cliente.join(',') : null,
      };
      // Remove chaves nulas ou vazias
      Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);
      console.log('[RelatorioOrdensView] apiParams:', params); // Log para debug
      return params;
    },
  },
  methods: {
    ...mapActions('relatorio', [
      'fetchRelatorioOrdens', // Action específica
      'exportarRelatorio',
      'limparDadosRelatorio'
    ]),
    ...mapActions('tipoServico', ['fetchTiposServico']),
    ...mapActions('cliente', ['fetchClientes']),
    ...mapMutations('relatorio', ['SET_ERRO']),

    async loadInitialData() {
      this.loadingTiposServico = true;
      this.loadingClientes = true;
      try {
        await Promise.all([
          this.fetchTiposServico().catch(e => console.error("Erro ao buscar tipos de serviço:", e)),
          this.fetchClientes().catch(e => console.error("Erro ao buscar clientes:", e))
        ]);
        await this.gerarRelatorio(); // Busca relatório inicial
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        this.loadingTiposServico = false;
        this.loadingClientes = false;
      }
    },

    async gerarRelatorio() {
      // A action correta já está mapeada
      try {
        await this.fetchRelatorioOrdens(this.apiParams);
      } catch (error) {
        console.error('Falha capturada em gerarRelatorio (Ordens):', error);
      }
    },

    async exportarPDFHandler() {
      try {
        await this.exportarRelatorio({ tipo: 'ordens', params: this.apiParams });
      } catch (error) {
        console.error('Falha capturada em exportarPDFHandler (Ordens):', error);
      }
    },

    // Handler para ordenação (emitido pelo filho)
    handleOrdenarOrdens(sortBy) {
      console.log("handleOrdenarOrdens recebido:", sortBy);
      // Lógica de ordenação: Se clicar no mesmo campo, inverte (ex: 'nome' -> '-nome')
      // Se clicar em campo diferente, define como novo campo.
      // A API deve entender '-nome' como descendente. Adapte se necessário.
      const novaOrdenacao = sortBy.key; // Supondo que v-data-table-server emite { key: 'campo', order: 'asc/desc' }
      const direcao = sortBy.order === 'desc' ? '-' : '';

      if (novaOrdenacao) {
        this.filtros.ordenacao = `${direcao}${novaOrdenacao}`;
        this.filtros.pagina = 1; // Resetar página ao ordenar
        this.gerarRelatorio(); // Busca com nova ordenação
      }
    },

    // Handler para mudança de página (emitido pelo filho)
    handleMudarPaginaOrdens(pagina) {
      if (this.filtros.pagina !== pagina) {
        this.filtros.pagina = pagina;
        this.gerarRelatorio(); // Busca nova página
      }
    },

    // Handler para mudança de itens por página (emitido pelo filho)
    handleItemsPerPageChange(items) {
      this.itemsPerPage = items;
      this.filtros.pagina = 1; // Resetar página ao mudar quantidade
      this.gerarRelatorio();
    },

    clearError() {
      this.SET_ERRO(null);
    },

    // Função debounced para gerar relatório
    debouncedGerarRelatorio: debounce(function () {
      this.filtros.pagina = 1; // Resetar página sempre que um filtro muda (via debounce)
      this.gerarRelatorio();
    }, 750), // Atraso de 750ms
  },
  watch: {
    // Observa os filtros (exceto pagina e ordenacao que são tratados nos handlers)
    'filtros.data_inicio': 'debouncedGerarRelatorio',
    'filtros.data_fim': 'debouncedGerarRelatorio',
    'filtros.status': 'debouncedGerarRelatorio',
    'filtros.tipo_servico': 'debouncedGerarRelatorio',
    'filtros.cliente': 'debouncedGerarRelatorio',
    // Não precisa mais observar apiParams diretamente se os handlers cuidam de paginação/ordenação
    // e o debounce cuida das mudanças nos filtros.
  },
  created() {
    this.loadInitialData();
  },
  beforeUnmount() {
    // Limpa dados do relatório específico ao sair da página (opcional)
    // this.limparDadosRelatorio();
    // Cancela o debounce
    this.debouncedGerarRelatorio.cancel();
  }
};
</script>

<style scoped>
/* Estilos da RelatorioView original podem ser copiados para cá se necessário */
.relatorio-ordens-view {
  margin-top: 1rem;
}

.v-card {
  margin-bottom: 1rem;
}

.v-btn {
  text-transform: none;
}

.d-flex.align-center {
  align-self: center;
}
</style>