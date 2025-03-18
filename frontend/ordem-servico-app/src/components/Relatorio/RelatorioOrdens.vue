<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-tabs v-model="activeTab">
          <v-tab value="ordens">ORDENS DE SERVIÇO</v-tab>
          <v-tab value="clientes">CLIENTES</v-tab>
        </v-tabs>
      </v-card-title>

      <v-card-text>
        <!-- Filtros -->
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filtros.dataInicio"
              type="date"
              label="Data Início"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filtros.dataFim"
              type="date"
              label="Data Fim"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtros.status"
              :items="statusOptions"
              label="Status"
              item-title="text"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-btn 
              color="primary"
              @click="gerarRelatorio"
              :loading="loading"
              variant="elevated"
            >
              GERAR RELATÓRIO
            </v-btn>
          </v-col>
        </v-row>

        <!-- Cards de Resumo -->
        <v-row class="mt-4">
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6">Total de Ordens</div>
                <div class="text-h4">{{ totalOrdens }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6">Valor Total</div>
                <div class="text-h4">R$ {{ formatarMoeda(valorTotal) }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card>
              <v-card-text class="text-center">
                <div class="text-h6">Média por Ordem</div>
                <div class="text-h4">R$ {{ formatarMoeda(mediaValor) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabela -->
        <v-table class="mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Tipo Serviço</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ordem in ordensServico" :key="ordem.id">
              <td>{{ ordem.id }}</td>
              <td>{{ ordem.cliente_nome }}</td>
              <td>{{ ordem.tipo_servico_nome }}</td>
              <td>{{ formatarData(ordem.data_criacao) }}</td>
              <td>R$ {{ formatarMoeda(ordem.valor_total) }}</td>
              <td>{{ ordem.status_display }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'RelatorioOrdens',

  data() {
    return {
      activeTab: 'ordens',
      loading: false,
      filtros: {
        dataInicio: '',
        dataFim: '',
        status: null
      },
      statusOptions: [
        { text: 'Aberto', value: 'ABERTO' },
        { text: 'Em Andamento', value: 'EM_ANDAMENTO' },
        { text: 'Concluído', value: 'CONCLUIDO' },
        { text: 'Cancelado', value: 'CANCELADO' }
      ]
    }
  },

  computed: {
    ordensServico() {
      return this.$store.state.ordemServico?.ordens || []
    },
    
    totalOrdens() {
      return this.ordensServico.length
    },

    valorTotal() {
      return this.ordensServico.reduce((total, ordem) => {
        const valor = parseFloat(ordem.valor_total || 0)
        return total + (isNaN(valor) ? 0 : valor)
      }, 0)
    },

    mediaValor() {
      return this.totalOrdens ? this.valorTotal / this.totalOrdens : 0
    }
  },

  methods: {
    async gerarRelatorio() {
      try {
        this.loading = true
        console.log('Gerando relatório com filtros:', this.filtros) // Debug

        // Chamada para a API
        const response = await this.$axios.get('/api/relatorios/ordens/', {
          params: {
            data_inicio: this.filtros.dataInicio,
            data_fim: this.filtros.dataFim,
            status: this.filtros.status
          }
        })

        // Atualiza o store com os dados recebidos
        this.$store.commit('ordemServico/SET_ORDENS', response.data)
        
        console.log('Dados recebidos:', response.data) // Debug
      } catch (error) {
        console.error('Erro ao gerar relatório:', error)
      } finally {
        this.loading = false
      }
    },

    formatarData(data) {
      if (!data) return ''
      return new Date(data).toLocaleDateString('pt-BR')
    },

    formatarMoeda(valor) {
      if (!valor) return '0,00'
      return Number(parseFloat(valor)).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  },

  // Carrega dados iniciais
  async created() {
    await this.gerarRelatorio()
  }
}
</script>

<style scoped>
.v-card {
  margin-bottom: 16px;
}

.v-table {
  width: 100%;
}
</style>