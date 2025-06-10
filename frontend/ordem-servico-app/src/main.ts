import { createApp } from 'vue'
import { type RouteLocationNormalized } from 'vue-router'

import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './plugins/axios'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(vuetify)

app.config.globalProperties.$filters = {
  status: (value: string) => {
    const statusMap: { [key: string]: string } = {
      'orcamento': 'Orçamento',
      'aprovado': 'Aprovado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    }
    return statusMap[value] || value
  }
}

router.afterEach((to: RouteLocationNormalized) => {
  const pageTitle = to.meta.title as string;
  document.title = pageTitle
    ? `${pageTitle} - Gerenciador de Ordens de Serviço`
    : 'Gerenciador de Ordens de Serviço'
})

app.mount('#app')