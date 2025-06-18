import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Ou o plugin do seu framework (react, etc.)
import path from 'path'; // <--- 1. IMPORTE O MÓDULO 'path'

export default defineConfig({
  plugins: [vue()],
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 5173,
    // Proxy para redirecionar chamadas /api para o backend Django
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // URL do seu backend
        changeOrigin: true,
      }
    }
  },

  // ---> 2. ADICIONE ESTA SEÇÃO PARA RESOLVER O ERRO DE IMPORTAÇÃO <---
  resolve: {
    alias: {
      // Diz ao Vite que '@' é um atalho para o diretório '/src'
      '@': path.resolve(__dirname, './src'),
    }
  }
});