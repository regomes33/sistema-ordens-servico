<template>
    <div class="ordem-servico-lista">
      <v-card>
        <v-card-title>
          Ordens de Serviço
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
            <v-col cols="12" sm="4">
              <v-select
                v-model="filtroStatus"
                :items="statusOptions"
                label="Filtrar por Status"
                clearable
                @change="aplicarFiltros"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="filtroCliente"
                :items="clientes"
                item-text="nome"
                item-value="id"
                label="Filtrar por Cliente"
                clearable
                @change="aplicarFiltros"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="filtroTipoServico"
                :items="tiposServico"
                item-text="nome"
                item-value="id"
                label="Filtrar por Tipo de Serviço"
                clearable
                @change="aplicarFiltros"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-data-table
          :headers="headers"
          :items="ordensServico"
          :search="search"
          :loading="loading"
          :sort-by="sortBy"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-btn color="primary" dark @click="navegarParaNovo">
                <v-icon left>mdi-plus</v-icon>
                Nova Ordem de Serviço
              </v-btn>
            </v-toolbar>
          </template>
          
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>
          
          <template v-slot:item.data_criacao="{ item }">
            {{ formatarData(item.data_criacao) }}
          </template>
          
          <template v-slot:item.data_servico="{ item }">
            {{ formatarData(item.data_servico) }}
          </template>
          
          <template v-slot:item.valor_total="{ item }">
            {{ formatarMoeda(item.valor_total) }}
          </template>
          
          <template v-slot:item.cliente="{ item }">
            {{ getClienteNome(item.cliente) }}
          </template>
          
          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="visualizarItem(item)"
            >
              mdi-eye
            </v-icon>
            <v-icon
              small
              class="mr-2"
              @click="editarItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="excluirItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
      
      <v-dialog v-model="dialogExclusao" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="fecharExclusao">Cancelar</v-btn>
            <v-btn color="red darken-1" text @click="confirmarExclusao">Confirmar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
        {{ snackbarText }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">
            Fechar
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    name: 'OrdemServicoLista',
    data() {
      return {
        search: '',
        headers: [
          { text: 'Cliente', value: 'cliente_nome' },
          { text: 'Tipo de Serviço', value: 'tipo_servico_nome' },
          { text: 'Data Criação', value: 'data_criacao' },
          { text: 'Data Serviço', value: 'data_servico' },
          { text: 'Valor Total', value: 'valor_total' },
          { text: 'Status', value: 'status' },
          { text: 'Ações', value: 'actions', sortable: false }
        ],
        dialogExclusao: false,
        ordemServicoParaExcluir: null,
        snackbar: false,
        snackbarText: '',
        snackbarColor: '',
        filtroStatus: null,
        filtroCliente: null,
        filtroTipoServico: null,
        statusOptions: [
          { text: 'Orçamento', value: 'orcamento' },
          { text: 'Aprovado', value: 'aprovado' },
          { text: 'Em Andamento', value: 'em_andamento' },
          { text: 'Concluído', value: 'concluido' },
          { text: 'Cancelado', value: 'cancelado' }
        ],
        statusMap: {
          'orcamento': 'Orçamento',
          'aprovado': 'Aprovado',
          'em_andamento': 'Em Andamento',
          'concluido': 'Concluído',
          'cancelado': 'Cancelado'
        },
        statusColors: {
          'orcamento': 'orange',
          'aprovado': 'blue',
          'em_andamento': 'blue',
          'concluido': 'green',
          'cancelado': 'red'
        },
        sortBy: [{ key: 'data_criacao', order: 'desc' }]
      };
    },
    computed: {
      ...mapState('ordemServico', ['ordensServico', 'loading', 'error']),
      ...mapState('cliente', ['clientes']),
      ...mapState('tipoServico', ['tiposServico'])
    },
    created() {
      this.fetchOrdensServico();
      this.fetchClientes();
      this.fetchTiposServico();
    },
    methods: {
      ...mapActions('ordemServico', ['fetchOrdensServico', 'deleteOrdemServico']),
      ...mapActions('cliente', ['fetchClientes']),
      ...mapActions('tipoServico', ['fetchTiposServico']),
      
      navegarParaNovo() {
        this.$router.push('/ordens-servico/novo');
      },
      
      visualizarItem(item) {
        this.$router.push(`/ordens-servico/${item.id}/detalhes`);
      },
      
      editarItem(item) {
        this.$router.push(`/ordens-servico/${item.id}/editar`);
      },
      
      excluirItem(item) {
        this.ordemServicoParaExcluir = item;
        this.dialogExclusao = true;
      },
      
      fecharExclusao() {
        this.dialogExclusao = false;
        this.ordemServicoParaExcluir = null;
      },
      
      async confirmarExclusao() {
        try {
          await this.deleteOrdemServico(this.ordemServicoParaExcluir.id);
          this.snackbarText = 'Ordem de serviço excluída com sucesso!';
          this.snackbarColor = 'success';
        } catch (error) {
          this.snackbarText = 'Erro ao excluir ordem de serviço';
          this.snackbarColor = 'error';
        }
        
        this.snackbar = true;
        this.fecharExclusao();
      },
      
      getStatusText(status) {
        return this.statusMap[status] || status;
      },
      
      getStatusColor(status) {
        return this.statusColors[status] || 'grey';
      },
      
      formatarData(dataString) {
        if (!dataString) return '';
        
        const data = new Date(dataString);
        return new Intl.DateTimeFormat('pt-BR').format(data);
      },
      
      formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valor);
      },
      
      getClienteNome(clienteId) {
        const cliente = this.clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : 'Cliente não encontrado';
      },
      
      aplicarFiltros() {
        const filtros = {};
        
        if (this.filtroStatus) {
          filtros.status = this.filtroStatus;
        }
        
        if (this.filtroCliente) {
          filtros.cliente = this.filtroCliente;
        }
        
        if (this.filtroTipoServico) {
          filtros.tipo_servico = this.filtroTipoServico;
        }
        
        this.fetchOrdensServico(filtros);
      }
    }
  };
  </script>