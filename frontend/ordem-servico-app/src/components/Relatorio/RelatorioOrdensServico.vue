<template>
  <div>
    <!-- Cards de Resumo (como antes) -->
    <v-row class="mt-4 px-4"> ... </v-row>

    <!-- Tabela com v-data-table-server -->
    <v-data-table-server v-model:items-per-page="localItemsPerPage" :headers="headers" :items="ordens"
      :items-length="totalItems" :loading="loading" :search="search" class="elevation-1 mt-4" item-value="id"
      @update:options="handleOptionsUpdate">
      <!-- Template para Status com v-chip -->
      <template v-slot:item.status_display="{ value }">
        <v-chip :color="getStatusColor(value)" small label>
          {{ value }}
        </v-chip>
      </template>
      <!-- Template para Valor formatado -->
      <template v-slot:item.valor_total="{ value }">{{ formatarMoeda(value) }}</template>
      <!-- Template para Data formatada -->
      <template v-slot:item.data_criacao="{ value }">
        {{ formatarData(value) }}
      </template>

      <!-- Mensagem de 'nenhum dado' -->
      <template v-slot:no-data>
        <div class="text-center pa-4 grey--text">
          Nenhuma ordem encontrada com os filtros selecionados.
        </div>
      </template>
      <!-- Loading -->
      <template v-slot:loading>
        <div class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">Carregando dados...</p>
        </div>
      </template>

    </v-data-table-server>
  </div>
</template>

<script>
export default {
  name: 'RelatorioOrdensServico',
  props: {
    ordens: { type: Array, required: true, default: () => [] },
    resumo: { type: Object, required: true, default: () => ({}) },
    loading: { type: Boolean, default: false },
    search: { type: String, default: '' },
    totalItems: { type: Number, default: 0 }, // Recebe total do pai
    itemsPerPage: { type: Number, default: 15 }, // Recebe do pai
    currentPage: { type: Number, default: 1 }, // Recebe do pai
    currentSort: { type: String, default: 'data_criacao' } // Recebe do pai
  },
  mounted() {
    console.log('RelatorioOrdensServico MOUNTED - Prop ordens:', JSON.stringify(this.ordens));
    console.log('RelatorioOrdensServico MOUNTED - Comprimento:', Array.isArray(this.ordens) ? this.ordens.length : 'N/A');
  },
  updated() {
    console.log('RelatorioOrdensServico UPDATED - Prop ordens:', JSON.stringify(this.ordens));
    console.log('RelatorioOrdensServico UPDATED - Comprimento:', Array.isArray(this.ordens) ? this.ordens.length : 'N/A');
  },
  data() {
    return {
      // Cabeçalhos para v-data-table-server
      headers: [
        { title: 'ID', key: 'id', align: 'start', sortable: true },
        { title: 'Cliente', key: 'cliente_nome', align: 'start', sortable: true },
        { title: 'Tipo Serviço', key: 'tipo_servico_nome', align: 'start', sortable: true },
        { title: 'Data Criação', key: 'data_criacao', align: 'start', sortable: true },
        { title: 'Valor', key: 'valor_total', align: 'end', sortable: true },
        { title: 'Status', key: 'status_display', align: 'start', sortable: false }, // Status pode não ser ordenável
      ],
      // Cópia local para v-model de items-per-page
      localItemsPerPage: this.itemsPerPage,
    }
  },

  watch: {
    // Atualiza cópia local se prop do pai mudar
    itemsPerPage(newVal) {
      this.localItemsPerPage = newVal;
    }
  },
  computed: {
    resumoCalculado() { /* ... como antes ... */ }
  },
  methods: {
    formatarData(dataIsoString) { /* ... como antes ... */ },
    formatarMoeda(valor) { /* ... como antes ... */ },
    getStatusColor(status) { /* ... como antes ... */ },

    // Método chamado pelo @update:options da v-data-table-server
    handleOptionsUpdate({ page, itemsPerPage, sortBy }) {
      console.log("Opções atualizadas:", { page, itemsPerPage, sortBy });

      // Emitir evento para mudança de itens por página
      if (itemsPerPage !== this.itemsPerPage) {
        this.$emit('update:items-per-page', itemsPerPage);
      }

      // Emitir evento para mudança de página
      if (page !== this.currentPage) {
        this.$emit('mudar-pagina', page);
      }

      // Emitir evento para ordenação
      // sortBy é um array [{ key: 'nome', order: 'asc'|'desc' }]
      const sortItem = sortBy.length ? sortBy[0] : null;
      // Constrói string de ordenação como antes (ou como a API esperar)
      const novaOrdenacao = sortItem ? `${sortItem.order === 'desc' ? '-' : ''}${sortItem.key}` : 'data_criacao'; // Default sort
      if (novaOrdenacao !== this.currentSort) {
        // Emite o objeto sortBy[0] ou a string formatada, dependendo do que o pai espera
        this.$emit('ordenar', sortItem || { key: 'data_criacao', order: 'asc' });
      }
    }
  }
}
</script>

<style scoped>
/* Estilos específicos */
</style>