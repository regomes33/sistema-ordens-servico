<template>
  <v-app-bar color="primary" dark app>
    <v-app-bar-nav-icon
      v-if="isAuthenticated"
      @click="$emit('toggle-drawer')"
    ></v-app-bar-nav-icon>

    <v-toolbar-title>{{ title }}</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn
      v-if="isAuthenticated"
      icon
      @click="toggleTheme"
    >
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <v-menu v-if="isAuthenticated" offset-y>
      <template #activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>{{ username }}</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="handleLogout">
          <v-list-item-title>Sair</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

defineEmits(['toggle-drawer'])

const store = useStore()
const router = useRouter()
const theme = useTheme()

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const username = computed(() => {
  const user = store.getters['auth/currentUser']
  return user ? user.username : ''
})
const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const handleLogout = async () => {
  try {
    await store.dispatch('auth/logout')
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script> 