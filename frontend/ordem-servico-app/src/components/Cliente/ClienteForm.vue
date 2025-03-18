<template>
    <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="cliente.nome"
              label="Nome do Cliente/Empresa"
              required
              :rules="[v => !!v || 'Nome é obrigatório']"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="cliente.nome_responsavel"
              label="Nome do Responsável"
              required
              :rules="[v => !!v || 'Nome do responsável é obrigatório']"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.telefone"
              label="Telefone"
              :rules="telefoneRules"
              @input="formatarTelefone"
              maxlength="15"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.cpf"
              label="CPF"
              :rules="cpfRules"
              @input="formatarCPF"
              maxlength="14"
              required
            ></v-text-field>
          </v-col>
          
          <v-col cols="12">
            <v-text-field
              v-model="cliente.email"
              label="E-mail"
              type="email"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col class="text-right">
            <v-btn 
              text 
              class="mr-2" 
              @click="$emit('cancel')"
            >
              Cancelar
            </v-btn>
            <v-btn 
              color="primary" 
              type="submit" 
              :loading="loading"
            >
              {{ isEdit ? 'Atualizar' : 'Cadastrar' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  import { mapState, mapActions } from 'vuex'
  import { useVuelidate } from '@vuelidate/core'
  import { required, email, minLength } from '@vuelidate/validators'
  
  export default defineComponent({
    name: 'ClienteForm',
    props: {
      clienteData: {
        type: Object,
        default: () => ({
          nome: '',
          nome_responsavel: '',
          telefone: '',
          email: ''
        })
      },
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    setup() {
      const state = {
        form: {
          nome: '',
          email: '',
          telefone: '',
          cpf: ''
        }
      }

      const rules = {
        form: {
          nome: { required },
          email: { required, email },
          telefone: { required },
          cpf: { required }
        }
      }

      const v$ = useVuelidate(rules, state)

      return { state, v$ }
    },
    data() {
      return {
        valid: true,
        cliente: { ...this.clienteData },
        form: {
          telefone: '',
          cpf: '',
          // ... outros campos
        },
        telefoneRules: [
          v => !!v || 'Telefone é obrigatório',
          v => v.length >= 14 || 'Telefone inválido'
        ],
        cpfRules: [
          v => !!v || 'CPF é obrigatório',
          v => v.length === 14 || 'CPF inválido'
        ]
      };
    },
    computed: {
      ...mapState('cliente', ['loading'])
    },
    watch: {
      clienteData(newVal) {
        this.cliente = { ...newVal };
      }
    },
    methods: {
      ...mapActions('cliente', ['createCliente', 'updateCliente']),
      
      formatarTelefone() {
        let valor = this.form.telefone.replace(/\D/g, '')
        if (valor.length > 0) {
          valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2')
          valor = valor.replace(/(\d{5})(\d)/, '$1-$2')
          this.form.telefone = valor
        }
      },

      formatarCPF() {
        let valor = this.form.cpf.replace(/\D/g, '')
        if (valor.length > 0) {
          valor = valor.replace(/^(\d{3})(\d)/g, '$1.$2')
          valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3')
          valor = valor.replace(/\.(\d{3})(\d)/g, '.$1-$2')
          this.form.cpf = valor
        }
      },

      limparFormatacao(valor) {
        return valor.replace(/\D/g, '')
      },

      validate() {
        return this.$refs.form.validate()
      },

      reset() {
        this.$refs.form.reset()
      },

      async submitForm() {
        if (this.validate()) {
          const dadosParaEnviar = {
            ...this.form,
            telefone: this.limparFormatacao(this.form.telefone),
            cpf: this.limparFormatacao(this.form.cpf)
          }
          try {
            if (this.isEdit) {
              await this.updateCliente({
                id: this.cliente.id,
                data: this.cliente
              });
              this.$emit('updated', this.cliente);
            } else {
              const newCliente = await this.createCliente(this.cliente);
              this.$emit('created', newCliente);
            }
            
            this.reset()
            this.cliente = {
              nome: '',
              nome_responsavel: '',
              telefone: '',
              email: ''
            };
          } catch (error) {
            console.error('Erro ao salvar cliente:', error);
          }
        }
      }
    }
  });
  </script>