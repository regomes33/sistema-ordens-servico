<template>
    <div class="tipo-servico-lista">
      <v-data-table
        :headers="headers"
        :items="tiposServico"
        :loading="loading"
        sort-by="nome"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Tipos de Serviço</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-btn color="primary" dark @click="navegarParaNovo">
              <v-icon left>mdi-plus</v-icon>
              Novo Tipo de Serviço
            </v-btn>
          </v-toolbar>
        </template>
        
        <template v-slot:item.actions="{ item }">
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
      
      <v-dialog v-model="dialogExclusao" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir este tipo de serviço? Esta ação não pode ser desfeita.
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
    name: 'TipoServicoLista',
    data() {
      return {
        headers: [
          { text: 'Nome', value: 'nome' },
          { text: 'Descrição', value: 'descricao' },
          { text: 'Ações', value: 'actions', sortable: false }
        ],
        dialogExclusao: false,
        tipoServicoParaExcluir: null,
        snackbar: false,
        snackbarText: '',
        snackbarColor: ''
      };
    },
    computed: {
      ...mapState('tipoServico', ['tiposServico', 'loading', 'error'])
    },
    created() {
      this.fetchTiposServico();
    },
    methods: {
      ...mapActions('tipoServico', ['fetchTiposServico', 'deleteTipoServico']),
      
      navegarParaNovo() {
        this.$router.push('/tipos-servico/novo');
      },
      
      editarItem(item) {
        this.$router.push(`/tipos-servico/${item.id}`);
      },
      
      excluirItem(item) {
        this.tipoServicoParaExcluir = item;
        this.dialogExclusao = true;
      },
      
      fecharExclusao() {
        this.dialogExclusao = false;
        this.tipoServicoParaExcluir = null;
      },
      
      async confirmarExclusao() {
        try {
          await this.deleteTipoServico(this.tipoServicoParaExcluir.id);
          this.snackbarText = 'Tipo de serviço excluído com sucesso!';
          this.snackbarColor = 'success';
        } catch (error) {
          this.snackbarText = 'Erro ao excluir tipo de serviço';
          this.snackbarColor = 'error';
        }
        
        this.snackbar = true;
        this.fecharExclusao();
      }
    }
  };
  </script>