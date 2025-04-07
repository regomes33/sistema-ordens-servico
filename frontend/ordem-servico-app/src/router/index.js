import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ClienteView from '@/views/ClienteView.vue'
import TipoServicoView from '@/views/TipoServicoView.vue'
import OrdemServicoView from '@/views/OrdemServicoView.vue'
import OrdemServicoDetalhe from '@/components/OrdemServico/OrdemServicoDetalhe.vue'
import OrdemServicoForm from '@/components/OrdemServico/OrdemServicoForm.vue'
import store from '../store'

// Lazy-loaded components
const ClientesView = () => import('../views/ClientesView.vue')
const TiposServicoView = () => import('../views/TiposServicoView.vue')
const RelatorioView = () => import('../views/RelatorioView.vue')
const RelatorioClientesView= () =>import('../views/RelatorioClientesView.vue')
const RelatorioOrdensView= () => import('../views/RelatorioOrdensView.vue')
const requireAuth = (to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.token) {
    console.log('Acesso negado: usuário não autenticado');
    // Guardar a URL que o usuário tentou acessar para redirecionamento após login
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
};

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Início',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Login',
      requiresAuth: false
    }
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: ClientesView,
    meta: {
      title: 'Clientes',
      requiresAuth: true
    }
  },
  {
    path: '/tipos-servico',
    name: 'tipos-servico',
    component: TiposServicoView,
    meta: {
      title: 'Tipos de Serviço',
      requiresAuth: true
    }
  },
  {
    path: '/ordens-servico',
    name: 'ordens-servico',
    component: OrdemServicoView,
    meta: {
      title: 'Ordens de Serviço',
      requiresAuth: true
    }
  },
  {
    path: '/ordem-servico/nova',
    name: 'ordem-servico-nova',
    component: OrdemServicoForm,
    meta: {
      title: 'Nova Ordem de Serviço',
      requiresAuth: true
    }
  },
  {
    path: '/ordem-servico/:id',
    name: 'ordem-servico-detalhe',
    component: OrdemServicoDetalhe,
    props: true,
    meta: {
      title: 'Detalhes da Ordem de Serviço',
      requiresAuth: true
    }
  },
  {
    path: '/ordens-servico/:id/editar',
    name: 'ordem-servico-editar',
    component: OrdemServicoForm,
    props: true,
    meta: {
      title: 'Editar Ordem de Serviço',
      requiresAuth: true
    }
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: RelatorioView,
    meta: {
      title: 'Relatórios',
      requiresAuth: true
    }
  },
  {
    path: '/relatorios/ordens',
    name: 'relatorioOrdens',
    component: RelatorioOrdensView,
    meta: {
      title: 'Relatórios Ordens',
      requiresAuth: true
    }
    // meta: { requiresAuth: true } // Se precisar de autenticação
  },
  {
    path: '/relatorios/clientes',
    name: 'relatorioClientes',
    component: RelatorioClientesView,
    meta: {
      title: 'Relatórios Clientes',
      requiresAuth: true
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guarda de navegação para autenticação
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router