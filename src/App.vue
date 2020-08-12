<template lang="pug">
  v-app
    v-main
      v-img(:src='"img/logo.png"' :height='60', :width='240')
      LoginButtons(v-if='!user')
      CurrentTodo(v-if='!!user')
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import LoginButtons from '@/components/LoginButtons.vue'
import CurrentTodo from '@/components/CurrentTodo.vue'
import { User } from '@/models/User'
import { namespace } from 'vuex-class'

const UserStore = namespace('UserStore')

@Component({ components: { LoginButtons, CurrentTodo } })
export default class App extends Vue {
  @UserStore.State user?: User
}
</script>

<style>
.image {
  max-width: 240px;
}
</style>
