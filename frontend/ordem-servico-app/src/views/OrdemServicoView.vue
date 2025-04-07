<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Ordens de Serviço</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          to="/ordem-servico/nova"
          elevation="2"
        >
          Nova Ordem
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- Usa v-if para esperar o fim do loading de AMBOS -->
        <ordem-servico-lista
          v-if="!loadingOrdens && !loadingClientes"
          :ordens="ordensServico"
          :clientes="clientes"
          :loading="loadingOrdens"
        />
        <!-- Mostra um indicador de progresso enquanto carrega -->
        <div v-else class="text-center pa-5">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-3">Carregando dados...</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import OrdemServicoLista from '@/components/OrdemServico/OrdemServicoLista.vue'; // Verifique o caminho

export default {
  name: 'OrdemServicoView',
  components: {
    OrdemServicoLista
  },
  computed: {
    ...mapState({
      // Obtém os dados e loading states do Vuex
      clientes: state => state.cliente.clientes,
      loadingClientes: state => state.cliente.loading,
      ordensServico: state => state.ordemServico.ordensServico,
      loadingOrdens: state => state.ordemServico.loading,
    })
  },
  methods: {
    // Mapeia as actions para buscar os dados
    ...mapActions({
      fetchClientes: 'cliente/fetchClientes',
      fetchOrdensServico: 'ordemServico/fetchOrdensServico'
    })
  },
  created() {
    // Chama as actions para buscar os dados quando a View é criada
    console.log("OrdemServicoView: created() hook - iniciando busca de dados...");
    this.fetchClientes();
    this.fetchOrdensServico();
  },
};
</script>

<style scoped>
/* Estilos se necessário */
</style>