<template>
  <div> <!-- Não precisa de v-container ou v-card aqui, pois já está dentro de um em RelatorioView -->
    <!-- Cards de Resumo - Usam a prop 'resumo' -->
    <v-row class="mt-4 px-4"> <!-- Adiciona padding -->
      <v-col cols="12" sm="4">
        <v-card elevation="2">
          <v-card-text class="text-center">
            <div class="text-overline">Total de Ordens</div>
            <div class="text-h4 font-weight-bold">{{ resumoCalculado.total_ordens }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card elevation="2">
          <v-card-text class="text-center">
            <div class="text-overline">Valor Total</div>
            <div class="text-h4 font-weight-bold"> {{ formatarMoeda(resumoCalculado.valor_total) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card elevation="2">
          <v-card-text class="text-center">
            <div class="text-overline">Média por Ordem</div>
            <div class="text-h4 font-weight-bold"> {{ formatarMoeda(resumoCalculado.media_valor) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Indicador de Loading ou Tabela -->
     <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-2">Carregando dados...</p>
      </div>
       <div v-else-if="!ordensFiltradas.length && !loading" class="text-center pa-8 grey--text">
         Nenhuma ordem encontrada com os filtros selecionados.
       </div>
      <v-table v-else class="mt-4 elevation-1">
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Cliente</th>
            <th class="text-left">Tipo Serviço</th>
            <th class="text-left">Data Criação</th>
            <th class="text-right">Valor</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Itera sobre ordens filtradas pela busca -->
          <tr v-for="ordem in ordensFiltradas" :key="ordem.id">
            <td>{{ ordem.id }}</td>
            <td>{{ ordem.cliente_nome }}</td>
            <td>{{ ordem.tipo_servico_nome }}</td>
            <td>{{ formatarData(ordem.data_criacao) }}</td>
            <td class="text-right">R$ {{ formatarMoeda(ordem.valor_total) }}</td>
            <td>
                <v-chip :color="getStatusColor(ordem.status_display)" small label>
                    {{ ordem.status_display }}
                </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>

  </div>
</template>

<script>
export default {
  name: 'RelatorioOrdensServico', // Nome corrigido
  props: {
    // Recebe a lista de ordens do componente pai (vindo do store)
    ordens: {
      type: Array,
      required: true,
      default: () => []
    },
    // Recebe o objeto de resumo do componente pai (vindo do store)
    resumo: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // Recebe o estado de loading do pai (vindo do store)
    loading: {
      type: Boolean,
      default: false
    },
     // Recebe o termo de busca do pai
    search: {
      type: String,
      default: ''
    }
  },
  computed: {
    // Filtra as ordens recebidas com base no termo de busca (prop 'search')
    ordensFiltradas() {
      if (!this.search) {
        return this.ordens; // Retorna tudo se não houver busca
      }
      const searchTerm = this.search.toLowerCase();
      return this.ordens.filter(ordem => {
        // Busca em campos relevantes (ID, nome cliente, tipo, status)
        return (
          String(ordem.id).includes(searchTerm) ||
          ordem.cliente_nome?.toLowerCase().includes(searchTerm) ||
          ordem.tipo_servico_nome?.toLowerCase().includes(searchTerm) ||
          ordem.status_display?.toLowerCase().includes(searchTerm)
        );
      });
    },
     // Um computed para garantir que o resumo tenha valores padrão se vier vazio
     resumoCalculado() {
        return {
            total_ordens: this.resumo?.total_ordens || 0,
            valor_total: this.resumo?.valor_total || 0,
            media_valor: this.resumo?.media_valor || 0,
            // Adicione outros campos do resumo se necessário
        };
     }
  },
  methods: {
    // Métodos de formatação permanecem aqui, pois são lógicos de apresentação
    formatarData(dataIsoString) {
      if (!dataIsoString) return 'N/A';
      try {
        // Assume que data_criacao é uma string ISO 8601 (ex: "2023-10-27T10:00:00Z")
        const data = new Date(dataIsoString);
        // Verifica se a data é válida
        if (isNaN(data.getTime())) return 'Data inválida';
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric' // Formato DD/MM/YYYY
        });
      } catch (e) {
        console.error("Erro ao formatar data:", dataIsoString, e);
        return 'Erro data';
      }
    },
    formatarMoeda(valor) {
      const numero = parseFloat(valor);
      if (isNaN(numero)) return '0,00';
      return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL' // Usa o formato de moeda BRL
      });
    },
     // Função para definir cor do chip de status (exemplo)
     getStatusColor(status) {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus.includes('concluído')) return 'success';
        if (lowerStatus.includes('em andamento')) return 'info';
        if (lowerStatus.includes('aprovado')) return 'warning';
        if (lowerStatus.includes('pendente')) return 'error';
        if (lowerStatus.includes('cancelado')) return 'error';
        if (lowerStatus.includes('orçamento')) return 'warning';
        return 'grey'; // Cor padrão
     }
  }
  // REMOVIDO: data(), created(), gerarRelatorio(), computed antigos baseados em store local
}
</script>

<style scoped>
/* Estilos específicos para a tabela ou cards de resumo, se necessário */
.v-table th {
    font-weight: bold;
}
.text-overline {
    color: grey;
}
</style>