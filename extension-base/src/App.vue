<template lang="pug">
v-app
  v-maind(:style='style')
    div.d-flex.flex-column.align-center
      v-img.mt-8.logo(:src='"img/logo-small.svg"', @click='goToTodorant')
      CurrentTodo(v-if='!!user')
      NotLoggined(v-else)
      AddTodo(style="display: none")
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import CurrentTodo from '@/views/current/CurrentTodo.vue'
import NotLoggined from '@/components/NotLoggined.vue'
import AddTodo from '@/views/AddTodo.vue'
import { User } from '@/models/User'
import { login } from '@/utils/login'

const UserStore = namespace('UserStore')
const AppStore = namespace('AppStore')

@Component({ components: { CurrentTodo, NotLoggined, AddTodo } })
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
    window.location.href = 'https://todorant.com'
  }
}
</script>

<style>
.container,
.background-colored,
.v-list,
.v-expansion-panel {
  background-color: #ffffff !important;
}
.theme--dark .container,
.theme--dark .background-colored,
.theme--dark .v-list,
.theme--dark .v-expansion-panel {
  background-color: #121212 !important;
}
* {
  font-family: Montserrat;
}

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
