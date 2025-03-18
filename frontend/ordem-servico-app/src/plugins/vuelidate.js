import { vuelidate as vuelidatePlugin } from '@vuelidate/core'

export default function setupVuelidate(app) {
  app.use(vuelidatePlugin)
}