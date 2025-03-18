<template>
  <div class="imagem-upload">
    <v-row>
      <v-col cols="12">
        <v-file-input
          v-model="files"
          accept="image/*"
          :rules="rules"
          prepend-icon="mdi-camera"
          label="Fotos do Serviço"
          @change="onFilesChange"
          :show-size="true"
          multiple
          counter
        >
          <template v-slot:selection="{ fileNames }">
            <template v-for="fileName in fileNames" :key="fileName">
              <v-chip
                size="small"
                label
                color="primary"
                class="me-2"
              >
                {{ fileName }}
              </v-chip>
            </template>
          </template>
        </v-file-input>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(preview, index) in previews"
        :key="index"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card>
          <v-img
            :src="preview.url"
            height="200"
            cover
            class="bg-grey-lighten-2"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card-text>
            <v-text-field
              v-model="preview.descricao"
              label="Descrição da imagem"
              variant="outlined"
              density="compact"
              @input="updateImageData"
            ></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              variant="text"
              @click="removerImagem(index)"
              size="small"
            >
              Remover
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'ImagemUpload',

  data() {
    return {
      files: [],
      previews: [],
      rules: [
        value => !value || !value.some(file => file.size > 2000000) || 'Cada imagem deve ter menos de 2 MB!',
        value => !value || value.every(file => file.type.startsWith('image/')) || 'Os arquivos devem ser imagens!'
      ]
    }
  },

  methods: {
    onFilesChange(files) {
      if (files && files.length) {
        files.forEach(file => {
          this.adicionarPreview(file)
        })
        this.updateImageData()
      }
    },

    adicionarPreview(file) {
      const preview = {
        file: file,
        url: URL.createObjectURL(file),
        descricao: ''
      }
      this.previews.push(preview)
    },

    removerImagem(index) {
      if (this.previews[index].url) {
        URL.revokeObjectURL(this.previews[index].url)
      }
      this.previews.splice(index, 1)
      this.updateImageData()
    },

    updateImageData() {
      const imageData = this.previews.map(preview => ({
        file: preview.file,
        descricao: preview.descricao
      }))
      this.$emit('update:modelValue', imageData)
    },

    limparTudo() {
      this.previews.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url)
        }
      })
      this.previews = []
      this.files = []
      this.updateImageData()
    }
  },

  beforeUnmount() {
    this.limparTudo()
  }
}
</script>

<style scoped>
.imagem-upload {
  max-width: 100%;
}
</style>