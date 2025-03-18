<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Tipos de Serviço</h1>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openDialog()"
      >
        NOVO TIPO DE SERVIÇO
      </v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Pesquisar"
          single-line
          hide-details
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="tiposServico"
        :search="search"
        :loading="loading"
        class="elevation-1"
      >
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
    </v-card>

    <!-- Dialog para adicionar/editar tipo de serviço -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.nome"
              label="Nome"
              :rules="[v => !!v || 'Nome é obrigatório']"
              required
            ></v-text-field>
            <v-textarea
              v-model="editedItem.descricao"
              label="Descrição"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="saveItem"
            :loading="saving"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const search = ref('')
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)
const valid = ref(false)
const form = ref(null)

const headers = [
  { title: 'Nome', align: 'start', key: 'nome' },
  { title: 'Descrição', align: 'start', key: 'descricao' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'end' }
]

const editedItem = ref({
  id: null,
  nome: '',
  descricao: ''
})

const defaultItem = {
  id: null,
  nome: '',
  descricao: ''
}

const formTitle = computed(() => {
  return editedItem.value.id ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'
})

const tiposServico = computed(() => {
  return store.state.tipoServico.tiposServico
})

async function fetchTiposServico() {
  loading.value = true
  try {
    await store.dispatch('tipoServico/fetchTiposServico')
  } catch (error) {
    console.error('Erro ao carregar tipos de serviço:', error)
  } finally {
    loading.value = false
  }
}

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = { ...defaultItem }
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  if (form.value) {
    form.value.reset()
  }
}

function editItem(item) {
  openDialog(item)
}

async function deleteItem(item) {
  if (confirm('Tem certeza que deseja excluir este tipo de serviço?')) {
    try {
      await store.dispatch('tipoServico/deleteTipoServico', item.id)
      await fetchTiposServico() // Recarrega a lista após deletar
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error)
    }
  }
}

async function saveItem() {
  if (!form.value.validate()) return

  saving.value = true
  try {
    if (editedItem.value.id) {
      await store.dispatch('tipoServico/updateTipoServico', editedItem.value)
    } else {
      await store.dispatch('tipoServico/createTipoServico', editedItem.value)
    }
    await fetchTiposServico() // Recarrega a lista após salvar
    closeDialog()
  } catch (error) {
    console.error('Erro ao salvar tipo de serviço:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchTiposServico()
})
</script> 