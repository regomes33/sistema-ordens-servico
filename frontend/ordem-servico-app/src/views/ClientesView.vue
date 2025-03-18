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
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.nome"
              label="Nome da Empresa"
              :rules="[v => !!v || 'Nome da empresa é obrigatório']"
              required
            ></v-text-field>

            <v-text-field
              v-model="editedItem.nome_responsavel"
              label="Nome do Responsável"
              :rules="[v => !!v || 'Nome do responsável é obrigatório']"
              required
            ></v-text-field>

            <v-text-field
              v-model="editedItem.email"
              label="E-mail"
              :rules="[
                v => !!v || 'E-mail é obrigatório',
                v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
              ]"
              required
            ></v-text-field>

            <v-text-field
              v-model="editedItem.telefone"
              label="Telefone"
              :rules="[v => !!v || 'Telefone é obrigatório']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="closeDialog"
          >
            CANCELAR
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="salvarCliente"
            :loading="saving"
            :disabled="!valid"
          >
            SALVAR
          </v-btn>
        </v-card-actions>
      </v-card>
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

      <template v-slot:item.acoes="{ item }">
        <v-icon
          size="small"
          class="me-2"
          @click="editItem(item.raw)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          @click="deleteItem(item.raw)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const dialog = ref(false)
const form = ref(null)
const valid = ref(false)
const search = ref('')
const loading = ref(false)
const saving = ref(false)

const headers = [
  { title: 'Nome da Empresa', key: 'nome' },
  { title: 'Responsável', key: 'nome_responsavel' },
  { title: 'E-mail', key: 'email' },
  { title: 'Telefone', key: 'telefone' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'end' }
]

const editedItem = ref({
  id: null,
  nome: '',
  nome_responsavel: '',
  email: '',
  telefone: ''
})

const defaultItem = {
  id: null,
  nome: '',
  nome_responsavel: '',
  email: '',
  telefone: ''
}

const clientes = computed(() => store.state.cliente.clientes)
const formTitle = computed(() => editedItem.value.id ? 'Editar Cliente' : 'Novo Cliente')

const openDialog = (item = null) => {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = { ...defaultItem }
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  if (form.value) {
    form.value.reset()
  }
}

const salvarCliente = async () => {
  if (!form.value?.validate()) return

  saving.value = true
  try {
    const clienteData = {
      nome: editedItem.value.nome,
      nome_responsavel: editedItem.value.nome_responsavel,
      email: editedItem.value.email,
      telefone: editedItem.value.telefone
    }

    if (editedItem.value.id) {
      await store.dispatch('cliente/updateCliente', {
        id: editedItem.value.id,
        data: clienteData
      })
    } else {
      await store.dispatch('cliente/createCliente', clienteData)
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

const editItem = (item) => {
  openDialog(item)
}

const deleteItem = async (item) => {
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