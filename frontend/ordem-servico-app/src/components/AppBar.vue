<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer">
    <v-list>
      <v-list-item
        prepend-icon="mdi-home"
        title="Início"
        value="inicio"
        to="/"
      ></v-list-item>

      <!-- ... resto dos itens do menu ... -->
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const drawer = ref(false)
const route = useRoute()

const currentPageTitle = computed(() => {
  const titles = {
    '/': 'Início',
    '/clientes': 'Clientes',
    '/tipos-servico': 'Tipos de Serviço',
    '/ordens-servico': 'Ordens de Serviço'
    // ... outros mapeamentos de rota para título
  }
  return titles[route.path] || 'Início'
})

const toggleDrawer = () => {
  drawer.value = !drawer.value
}
</script> 