import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './plugins/axios'

const app = createApp(App)

// Registrar plugins
app.use(router)
app.use(store)
app.use(vuetify)

// Filtro global para status
app.config.globalProperties.$filters = {
  status: (value) => {
    const statusMap = {
      'orcamento': 'Orçamento',
      'aprovado': 'Aprovado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    }
    return statusMap[value] || value
  }
}

// Configurar o título da página
router.afterEach((to) => {
  document.title = to.meta.title 
    ? `${to.meta.title} - Gerenciador de Ordens de Serviço` 
    : 'Gerenciador de Ordens de Serviço'
})

app.mount('#app')
