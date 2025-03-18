<template>
    <div class="tipo-servico-view">
      <v-card>
        <v-card-title>
          Gerenciar Tipos de Serviço
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
          <v-tab>Lista de Tipos de Serviço</v-tab>
          <v-tab>Novo Tipo de Serviço</v-tab>
          
          <v-tab-item>
            <tipo-servico-lista 
              :search="search"
              @edit="editTipoServico"
            ></tipo-servico-lista>
          </v-tab-item>
          
          <v-tab-item>
            <tipo-servico-form 
              :tipo-para-editar="tipoParaEditar"
              @saved="handleSaved"
            ></tipo-servico-form>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </div>
  </template>
  
  <script>
  import TipoServicoLista from '@/components/TipoServico/TipoServicoLista.vue';
  import TipoServicoForm from '@/components/TipoServico/TipoServicoForm.vue';
  
  export default {
    name: 'TipoServicoView',
    components: {
      TipoServicoLista,
      TipoServicoForm
    },
    data() {
      return {
        activeTab: 0,
        search: '',
        tipoParaEditar: null
      };
    },
    methods: {
      editTipoServico(tipo) {
        this.tipoParaEditar = tipo;
        this.activeTab = 1;
      },
      handleSaved() {
        this.tipoParaEditar = null;
        this.activeTab = 0;
        this.$root.$emit('show-message', {
          text: 'Tipo de serviço salvo com sucesso!',
          color: 'success'
        });
      }
    }
  };
  </script>