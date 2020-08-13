<template lang="pug">
  v-app(:style='style')
    v-maind.d-flex.flex-column.align-center
      v-img(:src='"img/logo.png"' :height='60', :width='240')
      CurrentTodo
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import CurrentTodo from '@/components/CurrentTodo.vue'
import { User } from '@/models/User'
import { login } from '@/utils/login'
import { setPassword } from '@/utils/setPassword'
import { setTheme } from '@/utils/setTheme'

const AppStore = namespace('AppStore')

@Component({ components: { CurrentTodo } })
export default class App extends Vue {
  @AppStore.State dark?: Boolean

  beforeCreate() {
    setPassword()
    login()
    setTheme()
  }

  get style() {
    return {
      'background-color': this.dark ? '#303030' : '#fafafa',
    }
  }
}
</script>

<style>
.image {
  max-width: 240px;
}
</style>
