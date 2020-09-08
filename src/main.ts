import Vue from 'vue'
import store from './store'
import App from './App.vue'
import { i18n } from './plugins/i18n'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

export const serverBus = new Vue()

new Vue({
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
