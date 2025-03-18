<template>
    <div class="ordem-servico-detalhe">
      <v-container>
        <v-overlay :value="loading">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <div v-if="ordemServico">
          <v-card>
            <v-card-title class="headline">
              Ordem de Serviço #{{ id }} - {{ getStatusText(ordemServico.status) }}
            </v-card-title>
            
            <v-card-text v-if="loading">
              <v-skeleton-loader type="article" class="mx-auto"></v-skeleton-loader>
            </v-card-text>
            
            <v-card-text v-else-if="ordemServico">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card outlined>
                    <v-card-title>Informações do Cliente</v-card-title>
                    <v-card-text>
                      <p><strong>Cliente:</strong> {{ ordemServico.cliente_nome }}</p>
                      <p><strong>Tipo de Serviço:</strong> {{ ordemServico.tipo_servico_nome }}</p>
                      <p><strong>Data de Criação:</strong> {{ formatDate(ordemServico.data_criacao) }}</p>
                      <p><strong>Data do Serviço:</strong> {{ formatDate(ordemServico.data_servico) }}</p>
                      <p><strong>Tempo de Garantia:</strong> {{ ordemServico.tempo_garantia }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-card outlined>
                    <v-card-title>Valores</v-card-title>
                    <v-card-text>
                      <p><strong>Mão de Obra:</strong> {{ formatCurrency(ordemServico.valor_mao_obra) }}</p>
                      <p><strong>Material:</strong> {{ formatCurrency(ordemServico.valor_material) }}</p>
                      <p class="headline"><strong>Total:</strong> {{ formatCurrency(ordemServico.valor_total) }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card outlined>
                    <v-card-title>Descrição</v-card-title>
                    <v-card-text>
                      <p>{{ ordemServico.descricao }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card outlined>
                    <v-card-title>Endereço</v-card-title>
                    <v-card-text>
                      <p>{{ ordemServico.endereco }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card outlined>
                    <v-card-title>
                      Imagens
                      <v-spacer></v-spacer>
                      <v-btn 
                        color="primary" 
                        text 
                        @click="showImageUpload = !showImageUpload"
                      >
                        <v-icon left>mdi-plus</v-icon>
                        Adicionar Imagem
                      </v-btn>
                    </v-card-title>
                    
                    <v-card-text v-if="showImageUpload">
                      <imagem-upload 
                        :ordem-servico-id="id" 
                        @image-uploaded="refreshImages"
                        @success="onUploadSuccess"
                        @error="onUploadError"
                      ></imagem-upload>
                    </v-card-text>
                    
                    <v-divider v-if="showImageUpload"></v-divider>
                    
                    <v-card-text v-if="ordemServico.imagens && ordemServico.imagens.length > 0">
                      <v-row>
                        <v-col 
                          v-for="imagem in ordemServico.imagens" 
                          :key="imagem.id" 
                          cols="12" sm="6" md="4" lg="3"
                        >
                          <v-card>
                            <v-img 
                              :src="imagem.imagem" 
                              aspect-ratio="1"
                              height="200"
                              @click="openImageDialog(imagem)"
                            ></v-img>
                            <v-card-text class="pa-2">
                              <small>{{ imagem.descricao || 'Sem descrição' }}</small>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    
                    <v-card-text v-else>
                      <p class="text-center">Nenhuma imagem disponível</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12">
                  <v-card outlined>
                    <v-card-title>Alterar Status</v-card-title>
                    <v-card-text>
                      <v-select
                        v-model="novoStatus"
                        :items="statusOptions"
                        item-text="text"
                        item-value="value"
                        label="Status"
                      ></v-select>
                      
                      <v-btn 
                        color="primary" 
                        :disabled="novoStatus === ordemServico.status"
                        :loading="atualizandoStatus"
                        @click="atualizarStatus"
                      >
                        Atualizar Status
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
            
            <v-card-actions>
              <v-btn 
                color="primary" 
                text 
                @click="$router.push('/ordens-servico')"
              >
                Voltar
              </v-btn>
              
              <v-btn 
                color="success" 
                text 
                @click="$router.push(`/ordens-servico/editar/${id}`)"
              >
                Editar
              </v-btn>
              
              <v-spacer></v-spacer>
              
              <v-btn 
                color="error" 
                text 
                @click="confirmarExclusao"
              >
                Excluir
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <v-alert
          v-else-if="!loading"
          type="error"
          text
          prominent
        >
          Ordem de serviço não encontrada ou você não tem permissão para visualizá-la.
        </v-alert>
      </v-container>
      
      <!-- Dialog para visualização de imagem -->
      <v-dialog v-model="imageDialog" max-width="800">
        <v-card>
          <v-img 
            :src="selectedImage.imagem" 
            contain
            max-height="600"
          ></v-img>
          <v-card-text>
            <p>{{ selectedImage.descricao || 'Sem descrição' }}</p>
            <p class="caption">Enviado em: {{ formatDate(selectedImage.data_upload) }}</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="imageDialog = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Dialog para confirmar exclusão -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Confirmar exclusão</v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
            <v-btn 
              color="error" 
              text 
              :loading="excluindo"
              @click="excluirOrdemServico"
            >
              Excluir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Snackbar para notificações -->
      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
        {{ snackbarText }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">
            Fechar
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRoute, useRouter } from 'vue-router'
  import ImagemUpload from './ImagemUpload.vue'
  
  const store = useStore()
  const route = useRoute()
  const router = useRouter()
  
  const loading = ref(false)
  const error = ref(null)
  const ordemServico = ref(null)
  const showImageUpload = ref(false)
  const imageDialog = ref(false)
  const selectedImage = ref({})
  const deleteDialog = ref(false)
  const excluindo = ref(false)
  const atualizandoStatus = ref(false)
  const novoStatus = ref('')
  const statusOptions = [
    { text: 'Orçamento', value: 'orcamento' },
    { text: 'Aprovado', value: 'aprovado' },
    { text: 'Em Andamento', value: 'em_andamento' },
    { text: 'Concluído', value: 'concluido' },
    { text: 'Cancelado', value: 'cancelado' }
  ]
  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')
  
  const statusMap = {
    'pendente': 'Pendente',
    'em andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado'
  }
  
  const loadOrdemServico = async () => {
    const id = route.params.id
    if (!id) return
  
    loading.value = true
    error.value = null
  
    try {
      const data = await store.dispatch('ordemServico/fetchOrdemServico', id)
      ordemServico.value = data
      novoStatus.value = data.status
    } catch (err) {
      console.error('Erro ao carregar ordem de serviço:', err)
      error.value = 'Erro ao carregar os dados da ordem de serviço'
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    loadOrdemServico()
  })
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  const getStatusText = (status) => {
    return statusMap[status] || status
  }
  
  const openImageDialog = (imagem) => {
    selectedImage.value = imagem
    imageDialog.value = true
  }
  
  const refreshImages = () => {
    loadOrdemServico()
    showImageUpload.value = false
  }
  
  const onUploadSuccess = (message) => {
    showSnackbar(message || 'Imagem carregada com sucesso!', 'success')
  }
  
  const onUploadError = (message) => {
    showSnackbar(message || 'Erro ao carregar imagem', 'error')
  }
  
  const confirmarExclusao = () => {
    deleteDialog.value = true
  }
  
  const excluirOrdemServico = async () => {
    excluindo.value = true
    try {
      await store.dispatch('ordemServico/deleteOrdemServico', route.params.id)
      showSnackbar('Ordem de serviço excluída com sucesso!', 'success')
      router.push('/ordens-servico')
    } catch (error) {
      showSnackbar('Erro ao excluir ordem de serviço', 'error')
      deleteDialog.value = false
    } finally {
      excluindo.value = false
    }
  }
  
  const atualizarStatus = async () => {
    if (novoStatus.value === ordemServico.value.status) return
    
    atualizandoStatus.value = true
    try {
      await store.dispatch('ordemServico/updateOrdemServico', {
        id: route.params.id,
        data: { status: novoStatus.value }
      })
      
      showSnackbar('Status atualizado com sucesso!', 'success')
      loadOrdemServico()
    } catch (error) {
      showSnackbar('Erro ao atualizar status', 'error')
    } finally {
      atualizandoStatus.value = false
    }
  }
  
  const showSnackbar = (text, color) => {
    snackbarText.value = text
    snackbarColor.value = color
    snackbar.value = true
  }
  </script>
  
  <style scoped>
  .v-card {
    margin-bottom: 16px;
  }
  </style>