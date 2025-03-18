<template>
  <v-container>
    <v-card class="mb-5">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Filtros</span>
        <v-btn 
          color="primary" 
          prepend-icon="mdi-plus"
          to="/ordem-servico/nova"
        >
          Nova Ordem
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Pesquisar"
              prepend-inner-icon="mdi-magnify"
              clearable
              @input="atualizarFiltros"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filtroStatus"
              :items="statusOptions"
              label="Status"
              clearable
              @update:model-value="atualizarFiltros"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filtroCliente"
              :items="clientesOptions"
              label="Cliente"
              clearable
              @update:model-value="atualizarFiltros"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-card>
      <ordem-servico-lista
        :search="search"
        :filtro-status="filtroStatus"
        :filtro-cliente="filtroCliente"
      ></ordem-servico-lista>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import OrdemServicoLista from '@/components/OrdemServico/OrdemServicoLista.vue'

export default {
  name: 'OrdemServicoView',
  
  components: {
    OrdemServicoLista
  },
  
  data() {
    return {
      search: '',
      filtroStatus: null,
      filtroCliente: null,
      statusOptions: [
        { title: 'Pendente', value: 'pendente' },
        { title: 'Em Andamento', value: 'em andamento' },
        { title: 'Concluído', value: 'concluido' },
        { title: 'Cancelado', value: 'cancelado' }
      ]
    }
  },
  
  computed: {
    ...mapState({
      clientes: state => state.cliente.clientes,
      ordensServico: state => state.ordemServico.ordensServico
    }),
    
    clientesOptions() {
      return this.clientes.map(cliente => ({
        title: cliente.nome,
        value: cliente.id
      }))
    }
  },
  
  methods: {
    ...mapActions({
      fetchClientes: 'cliente/fetchClientes',
      fetchOrdensServico: 'ordemServico/fetchOrdensServico'
    }),
    
    atualizarFiltros() {
      // Esta função seria usada para atualizar os filtros 
      // Se necessário, pode fazer uma nova chamada à API com os filtros aplicados
    }
  },
  
  created() {
    // Carregar dados necessários quando o componente é criado
    this.fetchClientes()
    this.fetchOrdensServico()
  }
}
</script>