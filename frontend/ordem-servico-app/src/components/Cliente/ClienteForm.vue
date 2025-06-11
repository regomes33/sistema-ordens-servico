<template>
  <!-- O @submit.prevent já garante que o formulário não recarregue a página -->
  <v-form ref="formRef" v-model="valid" @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="form.nome"
            label="Nome do Cliente/Empresa"
            :rules="[v => !!v || 'Nome é obrigatório']"
            required
            density="compact"
          ></v-text-field>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.nome_responsavel"
            label="Nome do Responsável"
            :rules="[v => !!v || 'Nome do responsável é obrigatório']"
            required
            density="compact"
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
            density="compact"
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
            density="compact"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.email"
            label="E-mail"
            type="email"
            :rules="[v => !v || /.+@.+\..+/.test(v) || 'E-mail deve ser válido']"
            density="compact"
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
// --- CORREÇÃO PRINCIPAL ---
// 1. Importando o tipo Cliente do arquivo centralizado.
//    Isso elimina a definição de tipo "privada" que causava o erro TS9006.
import type { Cliente } from '@/types/cliente';
import type { VForm } from 'vuetify/components'; // Importando tipo do VForm para a ref

// --- REFINAMENTO ---
// 2. Props e Emits estão mais claros e usam o tipo Cliente importado.
const props = defineProps<{
  clienteData?: Cliente | null; // A prop pode ser nula
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'submit', cliente: Cliente): void; // Simplificado para um único evento 'submit'
}>();

const store = useStore();
const valid = ref(true);
const formRef = ref<VForm | null>(null);

// Função para criar o estado inicial do formulário, evitando repetição.
const createInitialFormState = (): Cliente => ({
  id: null,
  nome: '',
  nome_responsavel: '',
  telefone: '',
  email: '',
  cpf: '',
  endereco: '',
  cep: '',
  cidade:'' ,  
});

// O formulário reativo é inicializado com os valores padrão.
const form = reactive<Cliente>(createInitialFormState());

// O getter do Vuex para o loading agora é tipado como boolean.
const loading = computed<boolean>(() => store.state.cliente.loading);

// --- REFINAMENTO ---
// 3. O watch agora lida melhor com a redefinição do formulário.
watch(() => props.clienteData, (newVal) => {
  if (newVal && props.isEdit) {
    // Modo de edição: preenche o formulário com dados existentes.
    Object.assign(form, newVal);
    // Formata os campos para exibição no formulário
    form.telefone = formatarTelefone(form.telefone);
    form.cpf = formatarCPF(form.cpf);
  } else {
    // Modo de criação ou cancelamento: reseta para o estado inicial.
    Object.assign(form, createInitialFormState());
    formRef.value?.resetValidation(); // Limpa as regras de validação
  }
}, { immediate: true, deep: true });

// --- SEM ALTERAÇÕES (JÁ ESTAVA BOM) ---
const telefoneRules = [
  (v: string) => !!v || 'Telefone é obrigatório',
  (v: string) => (v && v.length >= 14) || 'Telefone inválido',
];
const cpfRules = [
  (v: string) => !!v || 'CPF é obrigatório',
  (v: string) => (v && v.length === 14) || 'CPF inválido',
];

// --- REFINAMENTO ---
// 4. As funções de formatação agora retornam o valor, tornando-as mais puras.
const formatarTelefone = (value: string | null): string => {
  if (!value) return '';
  let valor = value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11); // Limita ao tamanho máximo
  valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
  valor = valor.replace(/(\d{5})(\d{4})/, '$1-$2'); // Ajustado para 9 dígitos
  form.telefone = valor;
  return valor;
};
const formatarCPF = (value: string | null): string => {
  if (!value) return '';
  let valor = value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11); // Limita ao tamanho máximo
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  form.cpf = valor;
  return valor;
};
const limparFormatacao = (valor: string): string => {
  return valor ? valor.replace(/\D/g, '') : '';
};

// --- REFINAMENTO ---
// 5. A lógica de submissão foi centralizada para chamar a action correta e emitir um único evento.
const submitForm = async () => {
  if (!formRef.value) return;

  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  // Prepara os dados removendo a formatação
  const dadosParaEnviar: Cliente = {
    ...form,
    telefone: limparFormatacao(form.telefone),
    cpf: limparFormatacao(form.cpf),
  };

  try {
    const action = props.isEdit ? 'cliente/updateCliente' : 'cliente/createCliente';
    const payload = props.isEdit ? { id: dadosParaEnviar.id, data: dadosParaEnviar } : dadosParaEnviar;
    
    await store.dispatch(action, payload);
    
    // Emite o evento de sucesso para o componente pai
    emit('submit', dadosParaEnviar);
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    // TODO: Adicionar feedback de erro para o usuário (ex: um snackbar/toast)
  }
};
</script>