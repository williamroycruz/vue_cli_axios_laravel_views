import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

import Lara from '@primeuix/themes/lara'
import 'primeicons/primeicons.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: { preset: Lara },
})
app.use(ToastService)

app.component('Toast', Toast)

app.mount('#app')
// app.use(PrimeVue, {
//   theme: { preset: Aura },
// })
