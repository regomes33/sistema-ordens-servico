<template>
  <v-container class="d-flex align-center justify-center fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <v-card class="elevation-12 login-card" rounded="lg">
          <v-card-title class="text-center pt-6">
            <h2 class="text-h4 font-weight-bold primary--text mb-2">Sistema de OS</h2>
            <p class="text-subtitle-1 text-medium-emphasis">Entre com suas credenciais</p>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
            >
              {{ errorMessage }}
            </v-alert>

            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Usuário"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :rules="[v => !!v || 'Usuário é obrigatório']"
                class="mb-4"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :type="showPassword ? 'text' : 'password'"
                :rules="[v => !!v || 'Senha é obrigatória']"
                class="mb-6"
                required
              ></v-text-field>

              <v-btn
                color="primary"
                block
                size="large"
                :loading="loading"
                :disabled="!valid"
                type="submit"
                height="50"
                class="mb-3"
                @click="handleLogin"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

// Definindo as propriedades reativas
const username = ref('')
const password = ref('')
const valid = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const form = ref(null)

// Método de login
const handleLogin = async () => {
  if (!form.value?.validate()) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await store.dispatch('auth/login', {
      username: username.value,
      password: password.value
    })

    // Se chegou aqui, login foi bem sucedido
    router.push('/')
  } catch (error) {
    console.error('Erro no login:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage.value = 'Credenciais inválidas'
          break
        case 401:
          errorMessage.value = 'Usuário ou senha incorretos'
          break
        default:
          errorMessage.value = 'Erro ao fazer login. Tente novamente.'
      }
    } else {
      errorMessage.value = 'Erro de conexão com o servidor'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-login {
  background-color: #f5f5f5;
  background-image: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

/* Ajuste para telas de diferentes tamanhos */
.login-card {
  border-radius: 16px;
  padding: 20px;
  max-width: 400px; /* Melhor ajuste para mobile */
  width: 90vw; /* Garante adaptação em telas menores */
}

@media (max-width: 600px) {
  .login-card {
    max-width: 90vw; /* Mantém o card proporcional no mobile */
    padding: 16px;
  }
}
</style>