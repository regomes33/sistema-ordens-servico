<template>
  <div>
    <h2 class="text-h4 mb-4">Dashboard - Ordens de Serviço</h2>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="mx-auto"
          color="primary"
          theme="dark"
        >
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">Orçamentos</div>
            <div class="text-h4">{{ contadores.orcamentos }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="mx-auto"
          color="secondary"
          theme="dark"
        >
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">Aprovados</div>
            <div class="text-h4">{{ contadores.aprovados }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="mx-auto"
          color="warning"
          theme="dark"
        >
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">Pendentes</div>
            <div class="text-h4">{{ contadores.pendentes }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="mx-auto"
          color="success"
          theme="dark"
        >
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">Concluídos</div>
            <div class="text-h4">{{ contadores.concluidos }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h5">Ordens de Serviço Recentes</h3>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        to="/ordem-servico/nova"
      >
        NOVA ORDEM
      </v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="ordensServico"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.raw.status)"
            :text="getStatusText(item.raw.status)"
            size="small"
          ></v-chip>
        </template>

        <template v-slot:item.acoes="{ item }">
          <v-icon
            size="small"
            class="me-2"
            @click="visualizarOrdem(item.raw)"
          >
            mdi-eye
          </v-icon>
          <v-icon
            size="small"
            @click="editarOrdem(item.raw)"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const search = ref('')
const loading = ref(false)

const headers = [
  { title: 'Cliente', key: 'cliente.nome' },
  { title: 'Data Serviço', key: 'data_servico' },
  { title: 'Data Entrega', key: 'data_entrega' },
  { title: 'Valor Total', key: 'valor_total' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'acoes', sortable: false }
]

const ordensServico = computed(() => store.state.ordemServico.ordensServico)

const contadores = computed(() => {
  const ordens = store.state.ordemServico.ordensServico
  return {
    orcamentos: ordens.filter(o => o.status === 'orcamento').length,
    aprovados: ordens.filter(o => o.status === 'aprovado').length,
    pendentes: ordens.filter(o => o.status === 'pendente').length,
    concluidos: ordens.filter(o => o.status === 'concluido').length
  }
})

const getStatusColor = (status) => {
  const colors = {
    orcamento: 'primary',
    aprovado: 'secondary',
    pendente: 'warning',
    concluido: 'success'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    orcamento: 'Orçamento',
    aprovado: 'Aprovado',
    pendente: 'Pendente',
    concluido: 'Concluído'
  }
  return texts[status] || status
}

const visualizarOrdem = (ordem) => {
  router.push(`/ordem-servico/${ordem.id}`)
}

const editarOrdem = (ordem) => {
  router.push(`/ordem-servico/${ordem.id}/editar`)
}

const fetchData = async () => {
  loading.value = true
  try {
    await store.dispatch('ordemServico/fetchOrdensServico')
  } catch (error) {
    console.error('Erro ao carregar ordens de serviço:', error)
  } finally {
    loading.value = false
  }
}

// Atualiza os dados quando o componente é montado
onMounted(() => {
  fetchData()
})

// Atualiza os dados quando retorna à página
const handleRouteChange = () => {
  if (router.currentRoute.value.name === 'dashboard') {
    fetchData()
  }
}

// Adiciona listener para atualização quando voltar à página
router.afterEach(handleRouteChange)
</script> 