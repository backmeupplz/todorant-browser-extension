<template lang="pug">
v-app
  v-maind(:style='style')
    div.d-flex.flex-column.align-center
      v-img(:src='"img/logo.png"' :height='60', :width='240')
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
import { setPassword } from '@/utils/setPassword'
import { setTheme } from '@/utils/setTheme'

const UserStore = namespace('UserStore')
const AppStore = namespace('AppStore')

@Component({ components: { CurrentTodo, NotLoggined } })
export default class App extends Vue {
  @UserStore.State user!: User
  @AppStore.State dark!: boolean

  beforeCreate() {
    setTheme()
    setPassword()
    login()
  }

  get style() {
    this.$vuetify.theme.dark = this.dark
    return {
      'background-color': this.dark ? '#303030' : '#fafafa',
      width: '100%',
      height: '100%',
    }
  }
}
</script>

<style>
.image {
  max-width: 240px;
}
</style>
