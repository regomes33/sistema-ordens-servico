<template>
    <div class="home">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                Dashboard - Ordens de Serviço
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Buscar"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6" md="2">
                    <v-card class="mx-auto" outlined color="primary" theme="dark">
                      <v-card-text class="text-center">
                        <div class="text-h6 mb-2">Orçamentos</div>
                        <div class="text-h4">{{ contadores.orcamentos }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="6" md="2">
                    <v-card class="mx-auto" outlined color="success" theme="dark">
                      <v-card-text class="text-center">
                        <div class="text-h6 mb-2">Aprovados</div>
                        <div class="text-h4">{{ contadores.aprovados }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="6" md="2">
                    <v-card class="mx-auto" outlined color="warning" theme="dark">
                      <v-card-text class="text-center">
                        <div class="text-h6 mb-2">Pendentes</div>
                        <div class="text-h4">{{ contadores.pendentes }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="6" md="2">
                    <v-card class="mx-auto" outlined color="info" theme="dark">
                      <v-card-text class="text-center">
                        <div class="text-h6 mb-2">Em Andamento</div>
                        <div class="text-h4">{{ contadores.emAndamento }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="6" md="2">
                    <v-card class="mx-auto" outlined color="success-darken-1" theme="dark">
                      <v-card-text class="text-center">
                        <div class="text-h6 mb-2">Concluídos</div>
                        <div class="text-h4">{{ contadores.concluidos }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="6" md="2">
                    <v-card class="mx-auto" outlined color="error" theme="dark">
                      <v-card-text class="text-center">
                        <div class="text-h6 mb-2">Cancelados</div>
                        <div class="text-h4">{{ contadores.cancelados }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Ordens de Serviço Recentes</span>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  to="/ordem-servico/nova"
                >
                  NOVA ORDEM
                </v-btn>
              </v-card-title>

              <v-card-text>
                <v-list v-if="ordensServico.length > 0">
                  <v-list-item
                    v-for="ordem in ordensServico"
                    :key="ordem.id"
                    :value="ordem"
                    @click="visualizarOrdem(ordem.id)"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="grey-lighten-1">
                        <v-icon>mdi-file-document-outline</v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title>
                      {{ ordem.cliente_nome }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                      Data: {{ formatDate(ordem.data_servico) }} - 
                      Valor: {{ formatMoney(ordem.valor_total) }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-chip
                        :color="getStatusColor(ordem.status)"
                        size="small"
                        class="mr-2"
                      >
                        {{ getStatusText(ordem.status) }}
                      </v-chip>
                      <v-btn
                        icon="mdi-eye"
                        variant="text"
                        size="small"
                        color="primary"
                        class="mr-2"
                        @click.stop="visualizarOrdem(ordem.id)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-pencil"
                        variant="text"
                        size="small"
                        color="warning"
                        @click.stop="editarOrdem(ordem.id)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>

                <div v-else class="text-center pa-4">
                  <v-icon
                    icon="mdi-alert-circle-outline"
                    size="large"
                    color="grey-lighten-1"
                    class="mb-2"
                  ></v-icon>
                  <div class="text-body-1 text-grey">
                    Nenhuma ordem de serviço encontrada
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>
                Clientes Recentes
                <v-spacer></v-spacer>
                <v-btn color="primary" text to="/clientes">
                  Ver Todos
                </v-btn>
              </v-card-title>
              
              <v-list two-line>
                <v-list-item
                  v-for="cliente in clientesRecentes"
                  :key="cliente.id"
                  @click="verCliente(cliente.id)"
                >
                  <v-list-item-avatar>
                    <v-icon large>mdi-account</v-icon>
                  </v-list-item-avatar>
                  
                  <v-list-item-content>
                    <v-list-item-title>{{ cliente.nome }}</v-list-item-title>
                    <v-list-item-subtitle>{{ cliente.telefone }}</v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <v-list-item-action>
                    <v-btn icon>
                      <v-icon>mdi-phone</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>
                Tipos de Serviço
                <v-spacer></v-spacer>
                <v-btn color="primary" text to="/tipos-servico">
                  Ver Todos
                </v-btn>
              </v-card-title>
              
              <v-list>
                <v-list-item
                  v-for="tipo in tiposServico"
                  :key="tipo.id"
                >
                  <v-list-item-icon>
                    <v-icon>mdi-hammer-wrench</v-icon>
                  </v-list-item-icon>
                  
                  <v-list-item-content>
                    <v-list-item-title>{{ tipo.nome }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="text-h6">
                Últimas Ordens de Serviço
              </v-card-title>

              <div v-if="ultimasOrdens.length > 0">
                <v-list>
                  <v-list-item
                    v-for="ordem in ultimasOrdens"
                    :key="ordem.id"
                    :value="ordem.id"
                    @click="navegarParaOrdem(ordem.id)"
                    class="mb-2"
                  >
                    <template v-slot:prepend>
                      <v-icon :color="getStatusColor(ordem.status)">
                        {{ getStatusIcon(ordem.status) }}
                      </v-icon>
                    </template>

                    <div>
                      <div class="text-subtitle-1">
                        {{ ordem.cliente_nome }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Data: {{ formatDate(ordem.data_servico) }}
                        <v-chip
                          :color="getStatusColor(ordem.status)"
                          size="x-small"
                          class="ml-2"
                        >
                          {{ getStatusText(ordem.status) }}
                        </v-chip>
                      </div>
                    </div>

                    <template v-slot:append>
                      <div class="text-subtitle-2 font-weight-bold">
                        {{ formatMoney(ordem.valor_total) }}
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else>
                <v-list>
                  <v-list-item>
                    <div class="text-center pa-4 text-medium-emphasis">
                      Nenhuma ordem de serviço encontrada
                    </div>
                  </v-list-item>
                </v-list>
              </div>

              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  variant="text"
                  to="/ordens-servico"
                >
                  Ver Todas
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="text-h6">
                Ações Rápidas
              </v-card-title>

              <v-list>
                <v-list-item
                  link
                  to="/ordem-servico/nova"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-plus-circle</v-icon>
                  </template>
                  <div class="text-subtitle-1">Nova Ordem de Serviço</div>
                </v-list-item>

                <v-list-item
                  link
                  to="/clientes"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account-multiple</v-icon>
                  </template>
                  <div class="text-subtitle-1">Gerenciar Clientes</div>
                </v-list-item>

                <v-list-item
                  link
                  to="/tipos-servico"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-wrench</v-icon>
                  </template>
                  <div class="text-subtitle-1">Tipos de Serviço</div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  
  const store = useStore()
  const router = useRouter()
  const loading = ref(false)
  
  const contadores = computed(() => {
    const ordens = store.state.ordemServico.ordensServico
    return {
      orcamentos: ordens.filter(o => o.status === 'orcamento').length,
      aprovados: ordens.filter(o => o.status === 'aprovado').length,
      pendentes: ordens.filter(o => o.status === 'pendente').length,
      emAndamento: ordens.filter(o => o.status === 'em_andamento').length,
      concluidos: ordens.filter(o => o.status === 'concluido').length,
      cancelados: ordens.filter(o => o.status === 'cancelado').length
    }
  })
  
  const ordensServico = computed(() => {
    const ordens = store.state.ordemServico.ordensServico
    console.log('Ordens computadas:', ordens) // Debug
    return ordens || []
  })
  
  const ultimasOrdens = computed(() => {
    const ordens = store.state.ordemServico.ordensServico
    return ordens
      .slice()
      .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
      .slice(0, 5)
  })
  
  const formatMoney = (value) => {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-BR')
  }
  
  const getStatusColor = (status) => {
    const colors = {
      'orcamento': 'primary',
      'aprovado': 'success',
      'pendente': 'warning',
      'em_andamento': 'info',
      'concluido': 'success-darken-1',
      'cancelado': 'error'
    }
    return colors[status] || 'grey'
  }
  
  const getStatusIcon = (status) => {
    const icons = {
      'orcamento': 'mdi-file-document-outline',
      'aprovado': 'mdi-check-circle',
      'pendente': 'mdi-clock-outline',
      'em_andamento': 'mdi-progress-wrench',
      'concluido': 'mdi-check-circle-outline',
      'cancelado': 'mdi-close-circle'
    }
    return icons[status] || 'mdi-help-circle-outline'
  }
  
  const getStatusText = (status) => {
    const texts = {
      'orcamento': 'ORÇAMENTO',
      'aprovado': 'APROVADO',
      'pendente': 'PENDENTE',
      'em_andamento': 'EM ANDAMENTO',
      'concluido': 'CONCLUÍDO',
      'cancelado': 'CANCELADO'
    }
    return texts[status] || status
  }
  
  const navegarParaOrdem = (id) => {
    router.push(`/ordem-servico/${id}`)
  }
  
  const visualizarOrdem = (id) => {
    router.push(`/ordem-servico/${id}`)
  }
  
  const editarOrdem = (id) => {
    router.push(`/ordem-servico/${id}/editar`)
  }
  
  const fetchData = async () => {
    loading.value = true
    try {
      await store.dispatch('ordemServico/fetchOrdensServico')
      console.log('Dados carregados:', store.state.ordemServico.ordensServico) // Debug
    } catch (error) {
      console.error('Erro ao carregar ordens:', error)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  })
  </script>

  <style scoped>
  .v-card {
    transition: transform 0.2s;
  }

  .v-card:hover {
    transform: translateY(-2px);
  }

  .v-list-item {
    border-radius: 8px;
    margin: 4px 8px;
  }

  .v-list-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }

  .text-subtitle-1 {
    font-weight: 500;
  }

  .text-caption {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }
  </style>