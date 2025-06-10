<template>
  <!-- 
    1. A ref do formulário é ligada diretamente a uma variável reativa.
    2. O evento de submit agora chama a função 'submitForm' diretamente.
    3. As regras de validação do Vuetify agora são passadas como um array de funções.
  -->
  <v-form ref="formRef" v-model="valid" @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="form.nome"
            label="Nome do Cliente/Empresa"
            required
            :rules="[v => !!v || 'Nome é obrigatório']"
          ></v-text-field>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.nome_responsavel"
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
            @update:model-value="formatarTelefone"
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
            @update:model-value="formatarCPF"
            maxlength="14"
            required
          ></v-text-field>
        </v-col>
        
        <v-col cols="12">
          <v-text-field
            v-model="form.email"
            label="E-mail"
            type="email"
            :rules="[v => !v || /.+@.+\..+/.test(v) || 'E-mail deve ser válido']"
          ></v-text-field>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col class="text-right">
          <v-btn 
            variant="text" 
            class="mr-2" 
            @click="emit('cancel')"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            type="submit" 
            :loading="loading"
            :disabled="!valid"
          >
            {{ isEdit ? 'Atualizar' : 'Cadastrar' }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useStore } from 'vuex';

// 2. Definindo Props e Emits com a sintaxe do <script setup>
interface Cliente {
  id?: number | string; // ID pode não existir em um novo cliente
  nome: string;
  nome_responsavel: string;
  telefone: string;
  email: string;
  cpf: string;
}

const props = defineProps<{
  clienteData?: Cliente;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'created', newCliente: Cliente): void;
  (e: 'updated', updatedCliente: Cliente): void;
}>();

// 3. Gerenciamento de Estado e Formulário com a Composition API
const store = useStore();
const valid = ref(true);

// Interface para a ref do formulário Vuetify
interface VForm extends HTMLFormElement {
  validate: () => Promise<{ valid: boolean; errors: any[] }>;
  reset: () => void;
}
const formRef = ref<VForm | null>(null);

// Dados do formulário
const form = reactive<Cliente>({
  id: undefined,
  nome: '',
  nome_responsavel: '',
  telefone: '',
  email: '',
  cpf: '',
});

// Acessando state do Vuex (loading)
const loading = computed(() => store.state.cliente.loading);

// 4. Sincronizando props com o estado local do formulário
watch(() => props.clienteData, (newVal) => {
  if (newVal) {
    // Copia os valores da prop para o formulário reativo
    Object.assign(form, newVal);
  }
}, { immediate: true, deep: true }); // 'immediate' garante que rode na primeira vez

// 5. Regras de Validação e Funções de Formatação
const telefoneRules = [
  (v: string) => !!v || 'Telefone é obrigatório',
  (v: string) => (v && v.length >= 14) || 'Telefone inválido',
];

const cpfRules = [
  (v: string) => !!v || 'CPF é obrigatório',
  (v: string) => (v && v.length === 14) || 'CPF inválido',
];

const formatarTelefone = (value: string) => {
  if (!value) return;
  let valor = value.replace(/\D/g, '');
  valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
  valor = valor.replace(/(\d{4,5})(\d{4})/, '$1-$2');
  form.telefone = valor.slice(0, 15);
};

const formatarCPF = (value: string) => {
  if (!value) return;
  let valor = value.replace(/\D/g, '');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  form.cpf = valor;
};

const limparFormatacao = (valor: string): string => {
  return valor.replace(/\D/g, '');
};

// 6. Lógica de Submissão do Formulário
const submitForm = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();

  if (valid) {
    const dadosParaEnviar = {
      ...form,
      telefone: limparFormatacao(form.telefone),
      cpf: limparFormatacao(form.cpf),
    };

    try {
      if (props.isEdit) {
        // Assegurando que o id existe para a atualização
        if (!dadosParaEnviar.id) throw new Error("ID do cliente é necessário para atualização.");
        await store.dispatch('cliente/updateCliente', {
          id: dadosParaEnviar.id,
          data: dadosParaEnviar
        });
        emit('updated', dadosParaEnviar);
      } else {
        const newCliente = await store.dispatch('cliente/createCliente', dadosParaEnviar);
        emit('created', newCliente);
      }
      
      formRef.value.reset(); // Reseta o formulário
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      // Aqui você poderia emitir um evento de erro para o componente pai
    }
  }
};
</script>