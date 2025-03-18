<template>
  <v-navigation-drawer v-model="drawerModel" app>
    <v-list-item class="pa-4">
      <v-list-item-title class="text-h6 font-weight-bold">
        Sistema de OS
      </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item 
        v-for="(item, i) in menuItems" 
        :key="i" 
        :to="item.to" 
        :prepend-icon="item.icon"
        :title="item.title"
        :active="$route.path === item.to"
        class="rounded-lg my-1 mx-2"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-4">
        <v-btn 
          block 
          color="error" 
          @click="logout" 
          prepend-icon="mdi-logout"
        >
          Sair
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'NavigationDrawer',
  
  props: {
    drawer: {
      type: Boolean,
      default: null
    }
  },
  
  computed: {
    drawerModel: {
      get() {
        return this.drawer;
      },
      set(value) {
        this.$emit('update:drawer', value);
      }
    }
  },
  
  data() {
    return {
      menuItems: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
        { title: 'Clientes', icon: 'mdi-account-group', to: '/clientes' },
        { title: 'Tipos de Serviço', icon: 'mdi-tools', to: '/tipos-servico' },
        { title: 'Ordens de Serviço', icon: 'mdi-clipboard-list', to: '/ordens-servico' },
        { title: 'Nova Ordem', icon: 'mdi-plus-circle', to: '/ordem-servico/nova' },
        { title: 'Relatórios', icon: 'mdi-chart-bar', to: '/relatorios' }
      ]
    }
  },
  
  methods: {
    ...mapActions({
      logoutAction: 'auth/logout'
    }),
    
    async logout() {
      await this.logoutAction();
      this.$router.push('/login');
      this.$root.$emit('show-message', {
        text: 'Logout realizado com sucesso',
        color: 'success'
      });
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background-color: rgb(var(--v-theme-primary-lighten-1)) !important;
  color: white !important;
}
</style> 