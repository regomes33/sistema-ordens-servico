<!-- RelatorioClientes.vue -->
<template>
  <div class="relatorio-clientes">
    <!-- Resumo (como antes) -->
    <div class="card mb-4">...</div>

    <!-- Use v-data-table-server -->
    <v-data-table-server
      v-model:items-per-page="localItemsPerPage"
      :headers="headers"
      :items="clientes"
      :items-length="totalItems"
      :loading="loading"
      :page="currentPage"
      :sort-by="currentSortFormatted"
      class="elevation-1"
      item-value="id"
      hover
      density="compact"
      @update:options="handleOptionsUpdate"
    >
    <template v-slot:item.valor_total_servicos="{ value }">
        {{ formatarMoeda(value) }}
      </template>

      <template v-slot:item.ultima_ordem="{ value }">
        {{ formatarData(value) }}
      </template>

      <template v-slot:item.total_ordens="{ value }">
         <div class="text-center">{{ value }}</div>
      </template>

      <template v-slot:item.nome="{ value }">
          {{ value }}
      </template>
       <template v-slot:item.email="{ value }">
          {{ value }}
      </template>
       <template v-slot:item.telefone="{ value }">
          {{ value }}
      </template>
       <!-- Loading -->
      <template v-slot:loading>
         <div class="text-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-2">Carregando dados...</p>
          </div>
      </template>

       <!-- Footer (opcional, se quiser customizar) -->
      <!-- <template v-slot:bottom> ... </template> -->

    </v-data-table-server>
     <!-- Botão Exportar CSV pode ficar fora da tabela -->
     <v-btn
         color="success"
         class="mt-4"
         @click="exportarCSV"
         :disabled="!clientes || clientes.length === 0"
         prepend-icon="mdi-file-export"
       >
         Exportar CSV
       </v-btn>
  </div>
</template>

<script>
// import { Chart } from 'chart.js/auto' // Mantenha se usar

export default {
  name: 'RelatorioClientes',
  props: {
    clientes: { type: Array, default: () => [] },
    resumo: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    // Renomear 'totalRegistros' para 'totalItems' para casar com v-data-table
    totalItems: { type: Number, default: 0 },
    itemsPerPage: { type: Number, default: 15 },
    currentPage: { type: Number, default: 1 },
    currentSort: { type: String, default: 'nome' }
  },
  data() {
    return {
      // Cabeçalhos para v-data-table-server
      headers: [
        { title: 'Nome', key: 'nome', align: 'start', sortable: true },
        { title: 'E-mail', key: 'email', align: 'start', sortable: true },
        { title: 'Telefone', key: 'telefone', align: 'start', sortable: false }, // Não ordenável?
        { title: 'Total Ordens', key: 'total_ordens', align: 'center', sortable: true }, // Centralizado
        { title: 'Valor Total Serviços', key: 'valor_total_servicos', align: 'end', sortable: true }, // Alinhado à direita
        { title: 'Última OS', key: 'ultima_ordem', align: 'start', sortable: true },
      ],
      // Cópia local para v-model de items-per-page
      localItemsPerPage: this.itemsPerPage,
      // error: null // Mantenha se usar
    }
  },
  watch: {
      itemsPerPage(newVal) { this.localItemsPerPage = newVal; },
      resumo(newResumo) { /* ... como antes ... */ }
  },
  computed: {
    // Renomeia totalRegistros para usar totalItems da prop
    // totalRegistros() { return this.totalItems; },
    totalPaginas() { return Math.ceil(this.totalItems / this.localItemsPerPage) || 1; },

    // Formata a string de ordenação para o formato esperado por v-data-table
    currentSortFormatted() {
        const isDesc = this.currentSort.startsWith('-');
        const key = isDesc ? this.currentSort.substring(1) : this.currentSort;
        return [{ key: key, order: isDesc ? 'desc' : 'asc' }];
    },
    ticketMedioCalculado() { /* ... como antes, usando this.resumo ... */ }
    // paginationRange pode não ser mais necessário se usar o footer padrão da tabela
  },
  mounted() { /* ... logs se precisar ... */},
  updated() { /* ... logs se precisar ... */},
  methods: {
    formatarData(data) { /* ... como antes ... */ },
    formatarMoeda(valor) {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return 'R$ 0,00'; // Garante prefixo
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    exportarCSV() { /* ... como antes ... */ },
    // carregarGraficos() { /* ... como antes ... */ },
    // criarGraficoClientesPorMes() { /* ... como antes ... */ },

    // Método chamado pelo @update:options da v-data-table-server
    handleOptionsUpdate({ page, itemsPerPage, sortBy }) {
       console.log("[RelatorioClientes] Opções atualizadas:", { page, itemsPerPage, sortBy });

        // Emitir evento para mudança de itens por página
        if (itemsPerPage !== this.itemsPerPage) {
            this.$emit('update:items-per-page', itemsPerPage);
        }

       // Emitir evento para mudança de página
       if (page !== this.currentPage) {
           this.$emit('mudar-pagina', page);
       }

       // Emitir evento para ordenação
       const sortItem = sortBy.length ? sortBy[0] : null;
       // Emite apenas a chave (ou a chave com '-') como o componente pai espera
       const novaOrdenacao = sortItem ? `${sortItem.order === 'desc' ? '-' : ''}${sortItem.key}` : 'nome'; // Default sort
       if (novaOrdenacao !== this.currentSort) {
           this.$emit('ordenar', novaOrdenacao); // Emite a string 'campo' ou '-campo'
       }
    }
  }
};
</script>

<style scoped>
/* Adicione estilos customizados se necessário, mas tente usar props/classes Vuetify primeiro */
/* Ex: Para linhas zebradas (se não for padrão no tema) */
/* .v-data-table > .v-table__wrapper > table > tbody > tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.03);
} */
</style>