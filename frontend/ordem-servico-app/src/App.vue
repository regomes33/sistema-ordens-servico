<template>
  <v-app>
    <!-- Cabeçalho da aplicação -->
    <app-header 
      title="Sistema de Ordens de Serviço" 
      @toggle-drawer="drawer = !drawer"
    />
    
    <!-- Menu lateral - só aparece se estiver autenticado -->
    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      permanent
    >
      <v-list-item
        title="Sistema de OS"
        class="text-h6 py-4"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
        ></v-list-item>
      </v-list>

      <template #append>
        <v-divider></v-divider>
        <v-list>
          <v-list-item
            prepend-icon="mdi-logout"
            title="SAIR"
            @click="handleLogout"
            color="error"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Conteúdo principal -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    
    <!-- Mensagens do sistema -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import { computed, ref, onMounted } from 'vue'
import { mapState, mapActions } from 'vuex'
import { eventBus } from '@/plugins/eventBus'
import NavigationDrawer from '@/components/Layout/NavigationDrawer.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useRouter } from 'vue-router'

interface MenuItem {
  title: string
  icon: string
  to: string
  value: string
}

export default defineComponent({
  name: 'App',
  
  components: {
    NavigationDrawer,
    AppHeader
  },
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const drawer = ref(true)
    
    const menuItems: MenuItem[] = [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', value: 'dashboard' },
      { title: 'Clientes', icon: 'mdi-account-group', to: '/clientes', value: 'clientes' },
      { title: 'Tipos de Serviço', icon: 'mdi-wrench', to: '/tipos-servico', value: 'tipos-servico' },
      { title: 'Ordens de Serviço', icon: 'mdi-clipboard-list', to: '/ordens-servico', value: 'ordens-servico' },
      { title: 'Nova Ordem', icon: 'mdi-plus-circle', to: '/ordem-servico/nova', value: 'nova-ordem' },
      { title: 'Relatórios Ordens', icon: 'mdi-chart-bar', to: '/relatorios/ordens', value: 'relatorios/ordens' },
      { title: 'Relatórios Clientes', icon: 'mdi-chart-bar', to: '/relatorios/clientes', value: 'relatorios/clientes' },
    ]

    const isAuthenticated = computed(() => {
      return store.getters['auth/isAuthenticated']
    })
    
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      }
    }

    const snackbar = ref({
      show: false,
      text: '',
      color: 'success',
      timeout: 3000
    })

    const showMessage = (text, color = 'success', timeout = 3000) => {
      snackbar.value = {
        show: true,
        text,
        color,
        timeout
      }
    }

    const irParaPerfil = () => {
      // Implemente a lógica para ir para o perfil do usuário
    }

    const toggleTheme = () => {
      // Implemente a lógica para alternar o tema
    }

    onMounted(() => {
      // Verifica autenticação ao iniciar a aplicação
      store.dispatch('auth/checkAuth').catch(error => {
        console.error('Erro ao verificar autenticação:', error)
      })
    })

    return {
      drawer,
      menuItems,
      isAuthenticated,
      handleLogout,
      snackbar,
      showMessage,
      irParaPerfil,
      toggleTheme
    }
  },

  mounted() {
    // Usar mounted em vez de created para garantir que o componente está montado
    eventBus.on('show-message', (event) => {
      const { text, color, timeout } = event
      this.showMessage(text, color, timeout)
    })

    // Aplicar tema escuro se estiver salvo
    const darkTheme = localStorage.getItem('darkTheme')
    if (darkTheme !== null) {
      this.$vuetify.theme.dark = darkTheme === 'true'
    }
  },

  unmounted() {
    // Limpar o listener quando o componente for desmontado
    eventBus.off('show-message')
  }
})
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.v-list-item--active {
  background-color: rgb(var(--v-theme-primary-lighten-1)) !important;
  color: white !important;
}

.v-navigation-drawer {
  padding: 8px;
  transition: 0.2s ease-in-out;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item {
  margin-inline: 4px;
}
</style>