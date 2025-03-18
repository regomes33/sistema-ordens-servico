<template>
    <div class="cliente-view">
      <v-card>
        <v-card-title>
          Gerenciar Clientes
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        
        <v-tabs v-model="activeTab">
          <v-tab>Lista de Clientes</v-tab>
          <v-tab>Novo Cliente</v-tab>
          
          <v-tab-item>
            <cliente-lista 
              :search="search"
              @edit="editCliente"
            ></cliente-lista>
          </v-tab-item>
          
          <v-tab-item>
            <cliente-form 
              :cliente-para-editar="clienteParaEditar"
              @saved="handleSaved"
            ></cliente-form>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </div>
  </template>
  
  <script>
  import ClienteLista from '@/components/Cliente/ClienteLista.vue';
  import ClienteForm from '@/components/Cliente/ClienteForm.vue';
  
  export default {
    name: 'ClienteView',
    components: {
      ClienteLista,
      ClienteForm
    },
    data() {
      return {
        activeTab: 0,
        search: '',
        clienteParaEditar: null
      };
    },
    methods: {
      editCliente(cliente) {
        this.clienteParaEditar = cliente;
        this.activeTab = 1;
      },
      handleSaved() {
        this.clienteParaEditar = null;
        this.activeTab = 0;
        this.$root.$emit('show-message', {
          text: 'Cliente salvo com sucesso!',
          color: 'success'
        });
      }
    }
  };
  </script>