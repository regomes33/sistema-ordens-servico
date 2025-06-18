<template>
  <div class="ordem-servico-form">
    <v-card>
      <v-card-title>
        {{ id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço' }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="ordemServico.cliente" :items="clientes" item-title="nome" item-value="id"
                  label="Cliente" :rules="[v => !!v || 'Cliente é obrigatório']" required></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="ordemServico.tipo_servico" :items="tiposServico" item-title="nome" item-value="id"
                  label="Tipos de Serviço" multiple chips
                  :rules="[v => v.length > 0 || 'Selecione pelo menos um tipo de serviço']" required></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="ordemServico.data_servico" label="Data do Serviço" type="date"
                  :rules="[v => !!v || 'Data é obrigatória']" required></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="ordemServico.tempo_garantia" label="Tempo de Garantia"
                  :rules="[v => !!v || 'Tempo de garantia é obrigatório']" required></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="ordemServico.valor_mao_obra" label="Valor Mão de Obra" type="number"
                  prefix="R$" :rules="[v => v >= 0 || 'Valor deve ser maior ou igual a zero']" required></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model.number="ordemServico.valor_material" label="Valor Material" type="number"
                  prefix="R$" :rules="[v => v >= 0 || 'Valor deve ser maior ou igual a zero']" required></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="ordemServico.status" :items="statusOptions" item-title="text" item-value="value"
                  label="Status" required></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model.number="valorTotal" label="Valor Total" prefix="R$" readonly
                  disabled></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea v-model="ordemServico.descricao" label="Descrição"
                  :rules="[v => !!v || 'Descrição é obrigatória']" required></v-textarea>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea v-model="ordemServico.endereco" label="Endereço"
                  :rules="[v => !!v || 'Endereço é obrigatório']" required></v-textarea>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <imagem-upload v-model="ordemServico.imagens" @update:modelValue="handleImagensChange" />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="secondary" @click="$router.push('/ordens-servico')">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="submitForm" :loading="loading" :disabled="!valid">
          {{ id ? 'Atualizar' : 'Criar' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-if="id" class="mt-4">
      <v-card-title>
        Imagens do Serviço
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showImageUpload = true" small>
          <v-icon left>mdi-camera</v-icon>
          Adicionar Imagem
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row v-if="imagens.length > 0">
          <v-col v-for="imagem in imagens" :key="imagem.id" cols="6" md="3" sm="4">
            <v-card>
              <v-img :src="imagem.imagem" aspect-ratio="1" class="grey lighten-2" height="200"
                @click="openImageDialog(imagem)"></v-img>
              <v-card-text class="pa-2">
                <small>{{ imagem.descricao || 'Sem descrição' }}</small>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-alert v-else type="info" class="mt-2">
          Nenhuma imagem adicionada ainda. Clique em "Adicionar Imagem" para incluir fotos do serviço.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Modal para upload de imagens -->
    <v-dialog v-model="showImageUpload" max-width="500px">
      <v-card>
        <v-card-title>Adicionar Imagem</v-card-title>
        <v-card-text>
          <imagem-upload :ordem-servico-id="id" @image-uploaded="handleImageUploaded"
            @error="handleUploadError"></imagem-upload>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal para visualizar imagem ampliada -->
    <v-dialog v-model="showImageDialog" max-width="800px">
      <v-card v-if="selectedImage">
        <v-card-title>
          {{ selectedImage.descricao || 'Imagem do Serviço' }}
          <v-spacer></v-spacer>
          <v-btn icon @click="showImageDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img :src="selectedImage.imagem" max-height="600" contain></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="confirmDeleteImage">
            <v-icon left>mdi-delete</v-icon>
            Excluir Imagem
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmação para excluir imagem -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteImage" :loading="deletingImage">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensagens -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ImagemUpload from './ImagemUpload.vue'
import ordemServicoService from '@/services/ordemServicoService'
import StatusSelect from './StatusSelect.vue'

export default {
  name: 'OrdemServicoForm',
  components: {
    ImagemUpload,
    StatusSelect
  },
  props: {
    id: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      valid: false,
      ordemServico: {
        cliente: null,
        tipo_servico: [],
        data_servico: '',
        tempo_garantia: '',
        descricao: '',
        valor_mao_obra: 0,
        valor_material: 0,
        endereco: '',
        status: 'pendente',
        imagens: []
      },
      imagens: [],
      showImageUpload: false,
      showImageDialog: false,
      showDeleteConfirm: false,
      selectedImage: null,
      deletingImage: false,
      snackbar: {
        show: false,
        text: '',
        color: 'info',
        timeout: 3000
      },
      statusOptions: [

        { text: 'Orçamento', value: 'ORCAMENTO' },
        { text: 'Aprovado', value: 'APROVADO' },
        { text: 'Pendente', value: 'PENDENTE' },
        { text: 'Em Andamento', value: 'EM_ANDAMENTO' },
        { text: 'Concluído', value: 'CONCLUIDO' },
        { text: 'Cancelado', value: 'CANCELADO' },
      ],
      // Erros de validação
      clienteErrors: [],
      tipoServicoErrors: [],
      dataServicoErrors: [],
      tempoGarantiaErrors: [],
      valorMaoObraErrors: [],
      valorMaterialErrors: [],
      descricaoErrors: [],
      enderecoErrors: []
    };
  },
  computed: {
    valorTotal() {
      return parseFloat(this.ordemServico.valor_mao_obra || 0) +
        parseFloat(this.ordemServico.valor_material || 0);
    },
    ...mapState({
      clientes: state => state.cliente.clientes,
      tiposServico: state => state.tipoServico.tiposServico,
      loading: state => state.ordemServico.loading || false
    })
  },
  created() {
    this.fetchClientes();
    this.fetchTiposServico();

    if (this.id) {
      this.fetchOrdemServico(this.id).then(ordem => {
        if (ordem) {
          this.ordemServico = {
            ...ordem,
            cliente: ordem.cliente.toString(),
            tipo_servico: ordem.tipo_servico.map(t => t.toString())
          };
          this.imagens = ordem.imagens || [];
        }
      }).catch(error => {
        this.showSnackbar('Erro ao carregar ordem de serviço', 'error');
        console.error('Erro ao carregar ordem:', error);
      });
    }
  },
  methods: {
    // Mapeando ações do store
    ...mapActions({
      fetchClientes: 'cliente/fetchClientes',
      fetchTiposServico: 'tipoServico/fetchTiposServico',
      // Aqui está o ponto crítico: o nome deve corresponder à ação no store
      createOrdemServico: 'ordemServico/createOrdemServico',
      updateOrdemServico: 'ordemServico/updateOrdemServico',
      fetchOrdemServico: 'ordemServico/fetchOrdemServico'
    }),

    validateForm() {
      // Limpar erros anteriores
      this.clienteErrors = [];
      this.tipoServicoErrors = [];
      this.dataServicoErrors = [];
      this.tempoGarantiaErrors = [];
      this.valorMaoObraErrors = [];
      this.valorMaterialErrors = [];
      this.descricaoErrors = [];
      this.enderecoErrors = [];

      let isValid = true;

      // Validar cliente
      if (!this.ordemServico.cliente) {
        this.clienteErrors.push('Selecione um cliente');
        isValid = false;
      }

      // Validar tipo de serviço
      if (this.ordemServico.tipo_servico.length === 0) {
        this.tipoServicoErrors.push('Selecione pelo menos um tipo de serviço');
        isValid = false;
      }

      // Validar data de serviço
      if (!this.ordemServico.data_servico) {
        this.dataServicoErrors.push('Informe a data do serviço');
        isValid = false;
      }

      // Validar tempo de garantia
      if (!this.ordemServico.tempo_garantia) {
        this.tempoGarantiaErrors.push('Informe o tempo de garantia');
        isValid = false;
      }

      // Validar valor da mão de obra
      if (this.ordemServico.valor_mao_obra < 0) {
        this.valorMaoObraErrors.push('O valor não pode ser negativo');
        isValid = false;
      }

      // Validar valor do material
      if (this.ordemServico.valor_material < 0) {
        this.valorMaterialErrors.push('O valor não pode ser negativo');
        isValid = false;
      }

      // Validar descrição
      if (!this.ordemServico.descricao) {
        this.descricaoErrors.push('Informe a descrição do serviço');
        isValid = false;
      }

      // Validar endereço
      if (!this.ordemServico.endereco) {
        this.enderecoErrors.push('Informe o endereço do serviço');
        isValid = false;
      }

      return isValid;
    },

    async submitForm() {
      if (!this.validateForm()) {
        this.showSnackbar('Verifique os campos destacados', 'warning');
        return;
      }

      try {
        const formData = this.prepareFormData();

        if (this.id) {
          await this.updateOrdemServico({
            id: this.id,
            data: formData
          });
          this.showSnackbar('Ordem de serviço atualizada com sucesso', 'success');
          await this.fetchOrdemServico(this.id).then(ordem => {
            if (ordem) {
              // Atualiza o objeto local com os dados frescos da API
              this.ordemServico = {
                ...ordem,
                cliente: ordem.cliente.toString(), // Ajuste conforme necessário
                tipo_servico: ordem.tipo_servico.map(t => t.toString()) // Ajuste conforme necessário
              };
            }
          });
        } else {
          const result = await this.createOrdemServico(formData);
          if (result && result.id) {
            this.showSnackbar('Ordem de serviço criada com sucesso', 'success');

            // Use a rota correta com o ID
            this.$router.push({
              name: 'ordem-servico-detalhe',
              params: { id: result.id }
            });
          }
        }
      } catch (error) {
        this.showSnackbar('Erro ao salvar ordem: ' + (error.message || 'Verifique sua conexão'), 'error');
        console.error('Erro ao salvar ordem:', error);
      }
    },

    prepareFormData() {
  // Cria um objeto JavaScript simples, em vez de FormData.
  const data = {
    cliente: this.ordemServico.cliente,
    tipo_servico: this.ordemServico.tipo_servico, // Envia o array de IDs diretamente
    data_servico: this.ordemServico.data_servico,
    tempo_garantia: this.ordemServico.tempo_garantia,
    descricao: this.ordemServico.descricao,
    valor_mao_obra: this.ordemServico.valor_mao_obra,
    valor_material: this.ordemServico.valor_material,
    status: this.ordemServico.status, // Garanta que o valor aqui seja o esperado pelo backend (ex: 'PENDENTE')
    endereco: this.ordemServico.endereco
  };

  // Este log agora mostrará exatamente o que será enviado como JSON.
  console.log('Dados a serem enviados como JSON:', data);
  return data;
},

    handleImagensChange(imageData) {
      this.ordemServico.imagens = imageData;
    },

    handleImageUploaded() {
      this.showImageUpload = false;
      this.showSnackbar('Imagem adicionada com sucesso', 'success');
      // Recarregar as imagens
      this.refreshImages();
    },

    handleUploadError(message) {
      this.showSnackbar(message || 'Erro ao fazer upload da imagem', 'error');
    },

    refreshImages() {
      if (this.id) {
        ordemServicoService.getById(this.id)
          .then(response => {
            this.imagens = response.data.imagens || [];
          })
          .catch(error => {
            console.error('Erro ao carregar imagens:', error);
          });
      }
    },

    openImageDialog(imagem) {
      this.selectedImage = imagem;
      this.showImageDialog = true;
    },

    confirmDeleteImage() {
      this.showImageDialog = false;
      this.showDeleteConfirm = true;
    },

    async deleteImage() {
      if (!this.selectedImage || !this.selectedImage.id) {
        return;
      }

      this.deletingImage = true;

      try {
        await ordemServicoService.deleteImagem(this.id, this.selectedImage.id);
        this.showDeleteConfirm = false;
        this.showSnackbar('Imagem excluída com sucesso', 'success');
        this.refreshImages();
      } catch (error) {
        this.showSnackbar('Erro ao excluir imagem', 'error');
        console.error('Erro ao excluir imagem:', error);
      } finally {
        this.deletingImage = false;
      }
    },

    showSnackbar(text, color = 'info') {
      this.snackbar = {
        show: true,
        text,
        color,
        timeout: color === 'error' ? 5000 : 3000
      };
    }
  }
};
</script>

<style scoped>
.ordem-servico-form {
  margin-bottom: 24px;
}
</style>