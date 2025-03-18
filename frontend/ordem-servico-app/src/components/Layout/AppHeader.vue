<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    
    <v-toolbar-title class="text-h6 font-weight-bold">
      {{ title }}
    </v-toolbar-title>
    
    <v-spacer></v-spacer>
    
    <v-btn icon @click="toggleTheme">
      <v-icon>{{ $vuetify.theme.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
    
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="navigateTo('/perfil')">
          <v-list-item-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            Perfil
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>
            <v-icon class="mr-2">mdi-logout</v-icon>
            Sair
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'AppHeader',
  
  props: {
    title: {
      type: String,
      default: 'Sistema de Ordens de Serviço'
    }
  },
  
  methods: {
    ...mapActions({
      logoutAction: 'auth/logout'
    }),
    
    navigateTo(route) {
      this.$router.push(route);
    },
    
    async logout() {
      await this.logoutAction();
      this.$router.push('/login');
      this.$root.$emit('show-message', {
        text: 'Logout realizado com sucesso',
        color: 'success'
      });
    },
    
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('darkTheme', this.$vuetify.theme.dark);
    }
  }
}
</script> 