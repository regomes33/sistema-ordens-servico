<template>
    <div class="relatorio-view">
      <v-container>
        <v-card>
          <v-card-title>
            Relatórios
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          
          <v-tabs v-model="activeTab" grow>
            <v-tab>Ordens de Serviço</v-tab>
            <v-tab>Clientes</v-tab>
          </v-tabs>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-menu
                  v-model="dataInicioMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dataInicio"
                      label="Data Início"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      :v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dataInicio"
                    @input="dataInicioMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-menu
                  v-model="dataFimMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dataFim"
                      label="Data Fim"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      :v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dataFim"
                    @input="dataFimMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFiltro"
                  :items="statusOptions"
                  label="Status"
                  multiple
                  chips
                  small-chips
                  deletable-chips
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-btn 
                  color="primary" 
                  block 
                  @click="gerarRelatorio"
                  :loading="isLoading"
                >
                  Gerar Relatório
                </v-btn>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="9">
                <!-- Filtros específicos baseados na tab ativa -->
                <v-select
                  v-if="activeTab === 0"
                  v-model="tipoServicoFiltro"
                  :items="tiposServicoArray"
                  item-title="nome"
                  item-value="id"
                  label="Tipo de Serviço"
                  multiple
                  chips
                  small-chips
                  deletable-chips
                ></v-select>
                
                <v-autocomplete
                  v-if="activeTab === 1 || activeTab === 0"
                  v-model="clienteFiltro"
                  :items="clientesArray"
                  item-title="nome"
                  item-value="id"
                  label="Cliente"
                  multiple
                  chips
                  small-chips
                  deletable-chips
                ></v-autocomplete>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-btn 
                  color="success" 
                  block 
                  @click="exportarPDF"
                  :loading="isLoading"
                >
                  <v-icon left>mdi-file-export</v-icon>
                  Exportar PDF
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          
          <!-- Alterar v-tabs-items para v-window -->
          <v-window v-model="activeTab">
            <!-- Alterar v-tab-item para v-window-item -->
            <v-window-item>
              <relatorio-ordens 
                :data="ordensData" 
                :loading="isLoading"
                :search="search"
              ></relatorio-ordens>
            </v-window-item>
            
            <v-window-item>
              <relatorio-clientes 
                :data="clientesData" 
                :loading="isLoading"
                :search="search"
              ></relatorio-clientes>
            </v-window-item>
          </v-window>
          
          <!-- Exibir mensagem de erro se houver -->
          <v-alert
            v-if="hasError"
            type="error"
            dismissible
            class="ma-3"
          >
            {{ errorMessage }}
          </v-alert>
        </v-card>
      </v-container>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import RelatorioOrdens from '@/components/Relatorio/RelatorioOrdens.vue';
  import RelatorioClientes from '@/components/Relatorio/RelatorioClientes.vue';
  
  export default {
    name: 'RelatorioView',
    
    components: {
      RelatorioOrdens,
      RelatorioClientes,
    },
    
    data() {
      return {
        activeTab: 0,
        search: '',
        dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substr(0, 10),
        dataFim: new Date().toISOString().substr(0, 10),
        dataInicioMenu: false,
        dataFimMenu: false,
        statusFiltro: [],
        tipoServicoFiltro: [],
        clienteFiltro: [],
        clientesData: {
          totalClientes: 0,
          clientesPorMes: [],
          resumo: {
            totalClientes: 0,
            novosClientes: 0,
            ticketMedio: 0,
            taxaRetencao: 0
          }
        },
        ordensData: {
          ordens: [],
          resumo: {
            total_ordens: 0,
            tempo_medio_dias: 0,
            valor_medio: 0,
            status_count: {}
          }
        },
        statusOptions: [
          { text: 'Aberto', value: 'ABERTO' },
          { text: 'Em Andamento', value: 'EM_ANDAMENTO' },
          { text: 'Concluído', value: 'CONCLUIDO' },
          { text: 'Cancelado', value: 'CANCELADO' }
        ]
      };
    },
    
    computed: {
      ...mapGetters('relatorio', [
        'isLoading',
        'hasError',
        'errorMessage'
      ]),
      
      ...mapGetters('tipoServico', ['getTiposServico']),
      ...mapGetters('cliente', ['clientes']),
      
      params() {
        return {
          data_inicio: this.dataInicio,
          data_fim: this.dataFim,
          status: this.statusFiltro.join(','),
          tipo_servico: this.tipoServicoFiltro.join(','),
          cliente: this.clienteFiltro.join(',')
        };
      },
      
      tiposServicoArray() {
        return this.getTiposServico || [];
      },
      
      clientesArray() {
        return this.clientes || [];
      }
    },
    
    created() {
      this.loadInitialData();
    },
    
    methods: {
      ...mapActions('relatorio', [
        'fetchRelatorioOrdens',
        'fetchRelatorioClientes',
        'exportarRelatorio'
      ]),
      ...mapActions('tipoServico', ['fetchTiposServico']),
      ...mapActions('cliente', ['fetchClientes']),
      
      async loadInitialData() {
        try {
          this.loading = true;
          await Promise.all([
            this.fetchTiposServico(),
            this.fetchClientes()
          ]);
        } catch (error) {
          console.error('Erro ao carregar dados iniciais:', error);
        } finally {
          this.loading = false;
        }
      },
      
      async gerarRelatorio() {
        try {
          switch (this.activeTab) {
            case 0:
              await this.fetchRelatorioOrdens(this.params);
              break;
            case 1:
              await this.fetchRelatorioClientes(this.params);
              break;
          }
        } catch (error) {
          console.error('Erro ao gerar relatório:', error);
        }
      },
      
      async exportarPDF() {
        try {
          const tipos = ['ordens', 'clientes'];
          const tipo = tipos[this.activeTab];
          
          await this.$store.dispatch('relatorio/exportarRelatorio', {
            tipo,
            params: {
              data_inicio: this.dataInicio,
              data_fim: this.dataFim,
              status: this.statusFiltro.join(','),
              tipo_servico: this.tipoServicoFiltro.join(','),
              cliente: this.clienteFiltro.join(',')
            }
          });

          this.$toast?.success('Relatório exportado com sucesso!');
        } catch (error) {
          console.error('Erro ao exportar PDF:', error);
          this.$toast?.error('Erro ao exportar relatório');
        }
      }
    },
    
    watch: {
      activeTab() {
        // Resetar busca quando mudar de tab
        this.search = '';
      }
    }
  };
  </script>
  
  <style scoped>
  .relatorio-view {
    margin-top: 20px;
    padding-bottom: 20px;
  }
  
  .v-card {
    margin-bottom: 20px;
  }
  
  .v-btn {
    text-transform: none;
  }
  </style>