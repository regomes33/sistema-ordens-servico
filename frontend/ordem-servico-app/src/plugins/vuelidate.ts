import { App } from 'vue'
import { vuelidate } from '@vuelidate/core'

export default function setupVuelidate(app: App): void {
  app.use(vuelidate)
} 