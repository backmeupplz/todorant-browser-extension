<template lang="pug">
v-app
  v-maind(:style='style')
    div.d-flex.flex-column.align-center
      v-img.mt-8.logo(:src='"img/logo-small.svg"', @click='goToTodorant')
      CurrentTodo(v-if='!!user')
      NotLoggined(v-else)
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import CurrentTodo from '@/components/CurrentTodo.vue'
import NotLoggined from '@/components/NotLoggined.vue'
import { User } from '@/models/User'
import { login } from '@/utils/login'

const UserStore = namespace('UserStore')
const AppStore = namespace('AppStore')

@Component({ components: { CurrentTodo, NotLoggined } })
export default class App extends Vue {
  @UserStore.State user!: User | undefined
  @AppStore.State dark!: boolean

  created() {
    login()
  }

  get style() {
    this.$vuetify.theme.dark = this.dark
    return {
      'background-color': this.dark ? '#121212' : '#ffffff',
      width: '100%',
      height: '100%',
    }
  }

  goToTodorant() {
    window.location.href =
      process.env.VUE_APP_FRONTEND || 'https://todorant.com'
  }
}
</script>

<style>
.image {
  max-width: 240px;
}
.logo {
  cursor: pointer;
  outline: none;
}

* {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  letter-spacing: -0.24px;
}
</style>
