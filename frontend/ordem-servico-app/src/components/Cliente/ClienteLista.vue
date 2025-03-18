<template>
    <div class="cliente-lista">
      <v-data-table
        :headers="headers"
        :items="clientes"
        :loading="loading"
        sort-by="nome"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Clientes</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-btn color="primary" dark @click="navegarParaNovo">
              <v-icon left>mdi-plus</v-icon>
              Novo Cliente
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
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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
    name: 'ClienteLista',
    data() {
      return {
        headers: [
          { text: 'Nome', value: 'nome' },
          { text: 'Responsável', value: 'nome_responsavel' },
          { text: 'Telefone', value: 'telefone' },
          { text: 'Email', value: 'email' },
          { text: 'Ações', value: 'actions', sortable: false }
        ],
        dialogExclusao: false,
        clienteParaExcluir: null,
        snackbar: false,
        snackbarText: '',
        snackbarColor: ''
      };
    },
    computed: {
      ...mapState('cliente', ['clientes', 'loading', 'error'])
    },
    created() {
      this.fetchClientes();
    },
    methods: {
      ...mapActions('cliente', ['fetchClientes', 'deleteCliente']),
      
      navegarParaNovo() {
        this.$router.push('/clientes/novo');
      },
      
      editarItem(item) {
        this.$router.push(`/clientes/${item.id}`);
      },
      
      excluirItem(item) {
        this.clienteParaExcluir = item;
        this.dialogExclusao = true;
      },
      
      fecharExclusao() {
        this.dialogExclusao = false;
        this.clienteParaExcluir = null;
      },
      
      async confirmarExclusao() {
        try {
          await this.deleteCliente(this.clienteParaExcluir.id);
          this.snackbarText = 'Cliente excluído com sucesso!';
          this.snackbarColor = 'success';
        } catch (error) {
          this.snackbarText = 'Erro ao excluir cliente';
          this.snackbarColor = 'error';
        }
        
        this.snackbar = true;
        this.fecharExclusao();
      }
    }
  };
  </script>