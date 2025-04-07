<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
         <!-- Campo de busca interno ao componente -->
        <v-text-field
          v-model="search"
          label="Pesquisar Ordens (Cliente, Descrição...)"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="ordens"          
      :search="search"          
      :loading="loading"         
      :items-per-page="10"     
      class="elevation-1"
      item-value="id" 
      :no-data-text="'Nenhuma ordem de serviço encontrada.'"
      :loading-text="'Carregando ordens...'"
    >
      <!-- Slot para personalizar a exibição do cliente -->
      <template v-slot:item.cliente="{ item }">
         <!-- Acessa 'cliente' diretamente do item da prop 'ordens' -->
         <!-- Usa 'raw' porque v-data-table v3+ envolve o item -->
         {{ getClienteNome(item.cliente) }}
      </template>

      <!-- Slot para personalizar a exibição do status com chip colorido -->
      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" dark small>
          {{ formatStatus(item.status) }}
        </v-chip>
      </template>

      <!-- Slot para personalizar a exibição da data -->
       <template v-slot:item.data_servico="{ item }">
         {{ formatDate(item.data_servico) }}
       </template>

      <!-- Slot para personalizar a exibição do valor total -->
       <template v-slot:item.valor_total="{ item }">
         {{ formatCurrency(item.valor_total) }}
       </template>

    <!-- Slot para ações (Ver, Editar, Excluir) -->
    <template v-slot:item.actions="{ item }">
        <v-tooltip location="top">
           <template v-slot:activator="{ props }">
            <!-- Passe 'item' diretamente -->
            <v-icon v-bind="props" small class="mr-2" @click="verDetalhes(item)" color="primary">
              mdi-eye
            </v-icon>
           </template>
           <span>Ver Detalhes</span>
        </v-tooltip>

         <v-tooltip location="top">
           <template v-slot:activator="{ props }">
             <!-- Passe 'item' diretamente -->
             <v-icon v-bind="props" small class="mr-2" @click="editarOrdem(item)" color="warning">
              mdi-pencil
            </v-icon>
           </template>
           <span>Editar</span>
         </v-tooltip>

         <v-tooltip location="top">
           <template v-slot:activator="{ props }">
             <!-- Passe 'item' diretamente -->
             <v-icon v-bind="props" small @click="confirmarExclusao(item)" color="error">
              mdi-delete
            </v-icon>
           </template>
           <span>Excluir</span>
         </v-tooltip>
      </template>

    </v-data-table>

    <!-- Diálogo de confirmação para exclusão -->
    <v-dialog v-model="dialogExcluir" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir a Ordem de Serviço #{{ itemParaExcluir?.id }}
          <!-- Usa getClienteNome aqui também -->
          para o cliente {{ getClienteNome(itemParaExcluir?.cliente) }}?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogExcluir = false">Cancelar</v-btn>
          <v-btn color="error darken-1" text @click="excluirOrdemConfirmada" :loading="loadingExclusao">Excluir</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

     <!-- Snackbar para feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script>
// Importa SOMENTE mapActions se precisar deletar daqui
import { mapActions } from 'vuex'; 

export default {
  name: 'OrdemServicoLista', // Nome do Componente Filho
  props: { // Define as props que recebe do Pai
    ordens: {
      type: Array,
      required: true,
      default: () => [] 
    },
    clientes: { // Recebe a lista completa de clientes
      type: Array,
      required: true,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      search: '', 
      dialogExcluir: false,
      itemParaExcluir: null,
      loadingExclusao: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      headers: [
        { title: 'ID', key: 'id', align: 'start', sortable: true, width: '80px' },
        { title: 'Cliente', key: 'cliente', sortable: true }, // Key é 'cliente' (o ID)
        { title: 'Descrição', key: 'descricao', sortable: false, width: '30%' }, 
        { title: 'Data', key: 'data_servico', sortable: true },
        { title: 'Status', key: 'status', sortable: true },
        { title: 'Valor Total', key: 'valor_total', sortable: true, align: 'end' },
        { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '120px' },
      ],
    };
  },
  computed: {
    // Mapa de clientes é útil aqui para exibir o nome baseado no ID recebido
    mapaClientes() {
      const mapa = {};
      // Usa a prop 'clientes' recebida
      this.clientes.forEach(cliente => {
        mapa[cliente.id] = cliente.nome;
      });
      return mapa;
    }
    // SEM mapState aqui
  },
  methods: {
    // mapActions apenas para ações que este componente dispara (ex: delete)
    ...mapActions({
        deleteOrdemServicoAction: 'ordemServico/deleteOrdemServico', 
    }),

    // Método para buscar o nome do cliente usando o mapa
    getClienteNome(clienteId) {
      return this.mapaClientes[clienteId] || `ID ${clienteId}`; // Fallback melhor
    },

    // Funções de formatação (iguais às que você já tinha)
    formatStatus(status) {
      if (!status) return '';
      return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusColor(status) {
      switch (status) {
        case 'pendente': return 'grey';
        case 'orcamento': return 'orange';
        case 'aprovado': return 'cyan';
        case 'em andamento': case 'em_andamento': return 'blue';
        case 'concluido': return 'success';
        case 'cancelado': return 'error';
        default: return 'default';
      }
    },
     formatCurrency(value) {
        if (value == null) return 'R$ 0,00';
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
     },
     formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString + 'T00:00:00'); 
            if (isNaN(date)) return dateString; 
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString; 
        }
     },

    // Métodos de ação (iguais)
    verDetalhes(item) {
      this.$router.push({ name: 'ordem-servico-detalhe', params: { id: item.id } });
    },
    editarOrdem(item) {
      this.$router.push({ name: 'ordem-servico-editar', params: { id: item.id } });
    },
    confirmarExclusao(item) {
      this.itemParaExcluir = item;
      this.dialogExcluir = true;
    },
    async excluirOrdemConfirmada() {
      if (!this.itemParaExcluir) return;
      this.loadingExclusao = true;
      try {
        await this.deleteOrdemServicoAction(this.itemParaExcluir.id);
        this.dialogExcluir = false;
        this.showSnackbar('Ordem de Serviço excluída com sucesso!', 'success');
        // O PAI (OrdemServicoView) é quem deve re-buscar os dados se necessário,
        // ou a mutação no store já removeu o item da lista que o pai está passando.
      } catch (error) {
        console.error("Erro ao excluir ordem:", error);
        this.showSnackbar('Erro ao excluir Ordem de Serviço.', 'error');
      } finally {
        this.loadingExclusao = false;
        this.itemParaExcluir = null; 
      }
    },
    showSnackbar(text, color = 'info') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  }
  // SEM created() hook aqui
};
</script>

<style scoped>
 .v-chip {
   font-weight: bold;
   font-size: 0.75rem;
   height: 24px;
 }
 .v-icon {
   cursor: pointer;
 }
</style>