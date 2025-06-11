<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Clientes</h1>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openDialog()"
      >
        NOVO CLIENTE
      </v-btn>
    </div>

    <!-- Dialog para adicionar/editar cliente -->
    <v-dialog v-model="dialog" max-width="500px">
      <!-- ... (conteúdo do dialog permanece o mesmo) ... -->
    </v-dialog>

    <!-- Tabela de clientes -->
    <v-data-table
      :headers="headers"
      :items="clientes"
      :search="search"
      :loading="loading"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Pesquisar"
          single-line
          hide-details
          class="mx-4"
        ></v-text-field>
      </template>
      
      <!-- 
        ↓↓↓ CORREÇÃO APLICADA AQUI ↓↓↓ 
        A variável `item` já é o objeto Cliente, então não usamos mais `.raw`
        e removemos a tipagem explícita que estava causando o conflito.
      -->
      <template #item.acoes="{ item }">
        <v-icon
          size="small"
          class="me-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<!-- O SCRIPT JÁ ESTAVA CORRETO E NÃO PRECISA DE MUDANÇAS -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { Cliente } from '@/types/cliente'
import type { VForm } from 'vuetify/components'

const store = useStore()
const dialog = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null)
const valid = ref(false)
const search = ref('')
const loading = ref(false)
const saving = ref(false)

const headers: any[] = [
  { title: 'Nome da Empresa', key: 'nome' },
  { title: 'Responsável', key: 'nome_responsavel' },
  { title: 'E-mail', key: 'email' },
  { title: 'Telefone', key: 'telefone' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'end' }
]

const editedItem = ref<Cliente>({
  id: null,
  nome: '',
  nome_responsavel: '',
  email: '',
  cpf: '',
  telefone: '',
  endereco: '',
  cep: '',
  cidade: '',

})

const defaultItem: Cliente = {
  id: null,
  nome: '',
  nome_responsavel: '',
  email: '',
  telefone: '',
  cpf: '',
  endereco: '',
  cep: '',
  cidade: '',
}

const clientes = computed<Cliente[]>(() => store.state.cliente.clientes)
const formTitle = computed(() => editedItem.value.id ? 'Editar Cliente' : 'Novo Cliente')

const openDialog = (item: Cliente | null = null) => {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = { ...defaultItem }
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    form.value?.resetValidation()
  }, 300)
}

const salvarCliente = async () => {
  const { valid } = await form.value!.validate()
  if (!valid) return

  saving.value = true
  try {
    if (editedItem.value.id) {
      await store.dispatch('cliente/updateCliente', {
        id: editedItem.value.id,
        data: editedItem.value
      })
    } else {
      await store.dispatch('cliente/createCliente', editedItem.value)
    }

    closeDialog()
    await fetchClientes()
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
  } finally {
    saving.value = false
  }
}

const fetchClientes = async () => {
  loading.value = true
  try {
    await store.dispatch('cliente/fetchClientes')
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  } finally {
    loading.value = false
  }
}

// A assinatura da função já espera um Cliente, o que está correto
const editItem = (item: Cliente) => {
  openDialog(item)
}

// A assinatura da função já espera um Cliente, o que está correto
const deleteItem = async (item: Cliente) => {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    try {
      await store.dispatch('cliente/deleteCliente', item.id)
      await fetchClientes()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
    }
  }
}

onMounted(() => {
  fetchClientes()
})
</script>