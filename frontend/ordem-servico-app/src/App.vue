<template>
  <v-app>
    <!-- Cabeçalho da aplicação -->
    <app-header 
      title="Sistema de Ordens de Serviço" 
      @toggle-drawer="drawer = !drawer"
    />
    
    <!-- Menu lateral - só aparece se estiver autenticado -->
    <!-- OBS: O componente NavigationDrawer que você importou não está sendo usado. Removi para limpar o código. -->
    <v-navigation-drawer
  v-if="isAuthenticated"
  v-model="drawer"
  app
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
      <template #actions>
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
import { defineComponent, computed, ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify'; // Hook correto para manipular temas no Vuetify 3
import AppHeader from '@/components/Layout/AppHeader.vue';
import { eventBus } from '@/plugins/eventBus';

// Interfaces para tipagem
interface MenuItem {
  title: string;
  icon: string;
  to: string;
  value: string;
}

interface SnackbarState {
  show: boolean;
  text: string;
  color: string;
  timeout: number;
}

export default defineComponent({
  name: 'App',
  
  components: {
    AppHeader,
    // Removi NavigationDrawer dos componentes pois não estava sendo usado no template.
    // O v-navigation-drawer do template é o componente nativo do Vuetify.
  },
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const theme = useTheme(); // Hook para gerenciar o tema
    const drawer = ref(true);
    
    const menuItems: MenuItem[] = [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', value: 'dashboard' },
      { title: 'Clientes', icon: 'mdi-account-group', to: '/clientes', value: 'clientes' },
      { title: 'Tipos de Serviço', icon: 'mdi-wrench', to: '/tipos-servico', value: 'tipos-servico' },
      { title: 'Ordens de Serviço', icon: 'mdi-clipboard-list', to: '/ordens-servico', value: 'ordens-servico' },
      { title: 'Nova Ordem', icon: 'mdi-plus-circle', to: '/ordem-servico/nova', value: 'nova-ordem' },
      { title: 'Relatórios Ordens', icon: 'mdi-chart-bar', to: '/relatorios/ordens', value: 'relatorios/ordens' },
      { title: 'Relatórios Clientes', icon: 'mdi-chart-bar', to: '/relatorios/clientes', value: 'relatorios/clientes' },
    ];

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/login');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    };

    const snackbar = ref<SnackbarState>({
      show: false,
      text: '',
      color: 'success',
      timeout: 3000,
    });

    // Função showMessage agora com tipos explícitos para seus parâmetros
    const showMessage = (payload: { text: string; color?: string; timeout?: number }) => {
      snackbar.value = {
        show: true,
        text: payload.text,
        color: payload.color || 'success', // Valor padrão se não for fornecido
        timeout: payload.timeout || 3000, // Valor padrão se não for fornecido
      };
    };

    const irParaPerfil = () => {
      // Implemente a lógica para ir para o perfil do usuário
      console.log('Navegando para o perfil...');
    };

    const toggleTheme = () => {
      // Lógica para alternar o tema usando o hook do Vuetify
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
      localStorage.setItem('darkTheme', theme.global.name.value);
    };

    // Hooks de ciclo de vida dentro do setup()
    onMounted(() => {
      // Verifica autenticação ao iniciar a aplicação
      store.dispatch('auth/checkAuth').catch((error: unknown) => { // <-- Adicionado o tipo 'unknown'
  console.error('Erro ao verificar autenticação:', error);
});

      // Listener do eventBus. 'showMessage' é a função que será chamada.
      eventBus.on('show-message', showMessage);

      // Aplicar tema escuro se estiver salvo
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme) {
        theme.global.name.value = savedTheme;
      }
    });

    onUnmounted(() => {
      // Limpar o listener quando o componente for desmontado para evitar memory leaks
      eventBus.off('show-message', showMessage);
    });

    return {
      drawer,
      menuItems,
      isAuthenticated,
      handleLogout,
      snackbar,
      // Não precisa mais retornar showMessage, irParaPerfil ou toggleTheme se não forem usados no template
      // Mas vamos manter caso precise deles lá.
      showMessage, 
      irParaPerfil,
      toggleTheme
    };
  },
  
  // NENHUM CÓDIGO AQUI. Options API (mounted, unmounted, data, methods) não deve ser misturada com setup().
});
</script>

<style>
/* Seu CSS continua o mesmo */
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