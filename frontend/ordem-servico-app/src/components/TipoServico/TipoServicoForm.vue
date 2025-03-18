<template>
    <div class="tipo-servico-form">
      <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
        <v-container>
          <v-card>
            <v-card-title>
              {{ id ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço' }}
            </v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="tipoServico.nome"
                    label="Nome"
                    required
                    :rules="[v => !!v || 'Nome é obrigatório']"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="tipoServico.descricao"
                    label="Descrição"
                    rows="4"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-card-text>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                text
                color="secondary"
                @click="voltar"
              >
                Cancelar
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
              >
                {{ id ? 'Atualizar' : 'Salvar' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-form>
      
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
    name: 'TipoServicoForm',
    props: {
      id: {
        type: [Number, String],
        default: null
      }
    },
    data() {
      return {
        valid: false,
        tipoServico: {
          nome: '',
          descricao: ''
        },
        snackbar: false,
        snackbarText: '',
        snackbarColor: ''
      };
    },
    computed: {
      ...mapState('tipoServico', ['loading', 'error'])
    },
    created() {
      if (this.id) {
        this.fetchTipoServico(this.id).then(tipoServico => {
          this.tipoServico = { ...tipoServico };
        }).catch(error => {
          this.snackbarText = 'Erro ao carregar tipo de serviço';
          this.snackbarColor = 'error';
          this.snackbar = true;
        });
      }
    },
    methods: {
      ...mapActions('tipoServico', [
        'fetchTipoServico',
        'createTipoServico',
        'updateTipoServico'
      ]),
      
      async submitForm() {
        if (this.$refs.form.validate()) {
          try {
            if (this.id) {
              await this.updateTipoServico({
                id: this.id,
                data: this.tipoServico
              });
              this.snackbarText = 'Tipo de serviço atualizado com sucesso!';
            } else {
              await this.createTipoServico(this.tipoServico);
              this.snackbarText = 'Tipo de serviço criado com sucesso!';
            }
            
            this.snackbarColor = 'success';
            this.snackbar = true;
            
            // Redirecionar após um breve atraso
            setTimeout(() => {
              this.voltar();
            }, 1000);
          } catch (error) {
            this.snackbarText = 'Erro ao salvar tipo de serviço';
            this.snackbarColor = 'error';
            this.snackbar = true;
          }
        }
      },
      
      voltar() {
        this.$router.push('/tipos-servico');
      }
    }
  };
  </script>