import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Searchbar from './searchbar.vue'

const app = createApp(App)
const searchbar = createApp(Searchbar)

app.use(createPinia())

app.mount('#app')
