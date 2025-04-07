<template>
    <div class="relatorio-clientes-view">
      <v-container>
        <v-card>
          <!-- Título e Busca -->
          <v-card-title>
            Relatório de Clientes
            <v-spacer></v-spacer>
             <!-- Busca pode ser feita no backend ou frontend (no filho) -->
             <!-- Se for no frontend, passe 'search' como prop para RelatorioClientes -->
             <!-- <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar cliente..."
              single-line
              hide-details
              density="compact"
              variant="underlined"
              class="mx-4"
              clearable
            ></v-text-field> -->
          </v-card-title>
  
          <!-- Filtros -->
          <v-card-text>
            <v-row>
              <!-- Data Início -->
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filtros.data_inicio"
                  label="Data Início (Ref. Ordens)"
                  type="date"
                  variant="outlined"
                  density="compact"
                  clearable
                  hint="Filtra clientes com base nas ordens neste período"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <!-- Data Fim -->
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filtros.data_fim"
                  label="Data Fim (Ref. Ordens)"
                  type="date"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </v-col>
              <!-- Cliente -->
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="filtros.cliente"
                  :items="clientesArray"
                  item-title="nome"
                  item-value="id"
                  label="Filtrar por Cliente(s) Específico(s)"
                  multiple
                  chips
                  small-chips
                  closable-chips
                  clearable
                  variant="outlined"
                  density="compact"
                  :loading="loadingClientes"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <!-- Botões -->
            <v-row>
               <v-col cols="12" md="9"></v-col> <!-- Spacer -->
               <!-- Botão Gerar -->
              <v-col cols="12" md="3" class="d-flex align-center">
                <v-btn
                  color="primary"
                  block
                  @click="gerarRelatorio"
                  :loading="isLoading"
                  :disabled="isLoading"
                  prepend-icon="mdi-sync"
                >
                  Gerar Relatório
                </v-btn>
              </v-col>
              <!-- Botão Exportar (PDF ou CSV? O componente filho tem CSV) -->
              <!-- Se for PDF, usar a action. Se for CSV, o botão pode ficar no filho -->
              <v-col cols="12" md="3" class="d-flex align-center">
                 <v-btn
                   color="success"
                   block
                   @click="exportarPDFHandler"
                   :loading="isLoading"
                   :disabled="isLoading || !dadosClientes.length"
                   prepend-icon="mdi-file-pdf-box"
                 >
                   Exportar PDF
                 </v-btn>
               </v-col>
            </v-row>
          </v-card-text>
  
          <!-- Componente Filho para exibir os dados -->
          <!-- Passando getters e state relevantes como props -->
          <relatorio-clientes
            :clientes="dadosClientes"
            :resumo="resumoClientes"
            :loading="isLoading"
            :total-items="totalClientes"
            :items-per-page="itemsPerPage"
            :current-page="filtros.pagina"
            :current-sort="filtros.ordenacao"
            @ordenar="handleOrdenarClientes"
            @mudar-pagina="handleMudarPaginaClientes"
            @update:items-per-page="handleItemsPerPageChange"
          />
  
          <!-- Alerta de Erro -->
          <v-alert v-if="hasError" type="error" closable class="ma-3" @update:modelValue="clearError">
            {{ getErrorMessage }}
          </v-alert>
        </v-card>
      </v-container>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import RelatorioClientes from '@/components/Relatorio/RelatorioClientes.vue'; // Verifique o caminho
  import { debounce } from 'lodash-es';
  
  export default {
    name: 'RelatorioClientesView',
    components: {
      RelatorioClientes,
    },
    data() {
      return {
        // search: '', // Se a busca for feita aqui
        itemsPerPage: 15, // Defina um valor padrão
        filtros: {
          data_inicio: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().substr(0, 10), // Default 1 ano atrás
          data_fim: new Date().toISOString().substr(0, 10),
          cliente: [],
          pagina: 1,
          ordenacao: 'nome', // Ordenação padrão
        },
        loadingClientes: false,
      };
    },
    computed: {
      ...mapGetters('relatorio', {
         isLoading: 'isLoading',
         hasError: 'hasError',
         getErrorMessage: 'getErrorMessage',
         //dadosClientes: 'getDadosClientes', // Mapeia getter específico
         resumoClientes: 'getResumoClientes', // Mapeia getter específico
         totalClientes: 'getTotalClientes',   // Mapeia getter para total
      }),

      dadosClientes(){
        const data = this.$store.getters['relatorio/getDadosClientes'];
      console.log("VIEW PAI - Computed dadosClientes:", JSON.stringify(data)); // Log no Pai
      return data;
      },
      
      ...mapGetters('cliente', ['clientes']), // Para o autocomplete de filtro
  
      clientesArray() { return this.clientes || []; },
  
      // Parâmetros formatados para a API
      apiParams() {
        const params = {
          ...this.filtros,
          itens_por_pagina: this.itemsPerPage,
          // Transforma arrays em strings separadas por vírgula
          cliente: this.filtros.cliente?.length ? this.filtros.cliente.join(',') : null,
        };
        // Remove chaves nulas ou vazias
        Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);
        console.log('[RelatorioClientesView] apiParams:', params); // Log para debug
        return params;
      },
    },
    methods: {
      ...mapActions('relatorio', [
        'fetchRelatorioClientes', // Action específica
        'exportarRelatorio',
        'limparDadosRelatorio'
      ]),
      ...mapActions('cliente', ['fetchClientes']), // Para carregar o filtro
      ...mapMutations('relatorio', ['SET_ERRO']),
  
      async loadInitialData() {
        this.loadingClientes = true;
        try {
          await this.fetchClientes().catch(e => console.error("Erro ao buscar clientes para filtro:", e));
          await this.gerarRelatorio(); // Busca relatório inicial
        } catch (error) {
          console.error('Erro ao carregar dados iniciais:', error);
        } finally {
          this.loadingClientes = false;
        }
      },
  
      async gerarRelatorio() {
        // A action correta já está mapeada
        try {
          await this.fetchRelatorioClientes(this.apiParams);
        } catch (error) {
          console.error('Falha capturada em gerarRelatorio (Clientes):', error);
        }
      },
  
      async exportarPDFHandler() {
        try {
          await this.exportarRelatorio({ tipo: 'clientes', params: this.apiParams });
        } catch (error) {
          console.error('Falha capturada em exportarPDFHandler (Clientes):', error);
        }
      },
  
      // Handler para ordenação (emitido pelo filho)
      handleOrdenarClientes(campo) {
         // A lógica aqui depende do que o filho 'RelatorioClientes' emite
         // Se ele emite apenas o nome do campo:
         console.log("handleOrdenarClientes recebido:", campo);
         if (this.filtros.ordenacao === campo) {
           // Inverte a direção se clicar no mesmo campo
           this.filtros.ordenacao = `-${campo}`;
         } else if (this.filtros.ordenacao === `-${campo}`) {
              // Volta para ascendente se clicar de novo
              this.filtros.ordenacao = campo;
         }
         else {
           // Define novo campo
           this.filtros.ordenacao = campo;
         }
         this.filtros.pagina = 1; // Resetar página ao ordenar
         this.gerarRelatorio(); // Busca com nova ordenação
      },
  
      // Handler para mudança de página (emitido pelo filho)
      handleMudarPaginaClientes(pagina) {
        if (this.filtros.pagina !== pagina) {
          this.filtros.pagina = pagina;
          this.gerarRelatorio(); // Busca nova página
        }
      },
  
      // Handler para mudança de itens por página (emitido pelo filho)
      handleItemsPerPageChange(items) {
          this.itemsPerPage = items;
          this.filtros.pagina = 1; // Resetar página ao mudar quantidade
          this.gerarRelatorio();
      },
  
      clearError() {
        this.SET_ERRO(null);
      },
  
      // Função debounced para gerar relatório
     
    },
    watch: {
          'filtros.data_inicio'(newValue, oldValue) {
      // Chama a função debounced que está em 'this'
      if (this.debouncedGerarRelatorio) {
        this.debouncedGerarRelatorio();
      }
    },
    'filtros.data_fim'(newValue, oldValue) {
      // Chama a função debounced que está em 'this'
      if (this.debouncedGerarRelatorio) {
        this.debouncedGerarRelatorio();
      }
    },
    'filtros.cliente'(newValue, oldValue) {
      // Chama a função debounced que está em 'this'
      if (this.debouncedGerarRelatorio) {
        this.debouncedGerarRelatorio();
      }
    },
    // Você pode opcionalmente adicionar { deep: true } se 'filtros.cliente' for um array/objeto
    // e você quiser detectar mudanças internas, mas para seleção múltipla simples não deve ser necessário.
  },
    created() {
      this.debouncedGerarRelatorio= debounce(()=> {
          this.filtros.pagina = 1; // Resetar página sempre que um filtro muda (via debounce)
          this.gerarRelatorio();
      }, 750);
      
      this.loadInitialData();
    },
    beforeUnmount() {
      console.log("BEFOREUNMOUNT - Verificando this.debouncedGerarRelatorio:", this.debouncedGerarRelatorio);
    if (this.debouncedGerarRelatorio && typeof this.debouncedGerarRelatorio.cancel === 'function') {
      this.debouncedGerarRelatorio.cancel();
      console.log("BEFOREUNMOUNT - Debounce cancelado com sucesso.");
    } else {
       console.warn("BEFOREUNMOUNT - Não foi possível cancelar debounce: função ou método .cancel não encontrado.");
    }
  }
    
  };
  </script>
  
  <style scoped>
  /* Estilos da RelatorioView original podem ser copiados para cá se necessário */
  .relatorio-clientes-view { margin-top: 1rem; }
  .v-card { margin-bottom: 1rem; }
  .v-btn { text-transform: none; }
  .d-flex.align-center { align-self: center; }
  </style>