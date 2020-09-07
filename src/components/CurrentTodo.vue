<template lang="pug">
v-container(
  style='maxWidth: 1000px;',
)
  v-list(:color='dark ? "#303030" : "#fafafa"')
    v-list-item
      v-progress-linear(
        rounded,
        :value='progress',
        height='25',
        :color='dark ? undefined : "blue lighten-3"',
        :loading='todoUpdating'
      )
        template(v-slot='{ value }')
          span.caption {{ todosCount - incompleteTodosCount }}/{{ todosCount }}
        v-spacer.px-2
      v-btn(text, icon, :loading='todoUpdating', @click='updateTodo')
        v-icon refresh
    v-list-item
      v-list-item-content(v-if='!!todo')
        v-card.grey(:class='dark ? "darken-2" : "lighten-4"')
          v-card-text
            TodoText(
              :todo='todo',
              :text='text',
              :errorDecrypting='errorDecrypting'
            )
          v-card-actions
            v-icon.grey--text.pl-2(small, v-if='todo.encrypted') vpn_key
            v-icon.grey--text.pl-2(small, v-if='todo.skipped') arrow_forward
            v-spacer
            v-btn(text, icon, :loading='loading', @click='deleteTodo')
              v-icon delete
            v-btn.ma-0(
              text,
              icon,
              @click='skipTodo',
              :loading='loading',
              v-if='incompleteTodosCount > 1 && !todo.frog && !todo.time'
            )
              v-icon arrow_right_alt
            v-tooltip.ml-4(:max-width='300', bottom)
              template(v-slot:activator='{ on }')
                v-btn(
                  text,
                  icon,
                  @click='addTodo()',
                  :loading='loading',
                  v-on='on',
                  v-shortkey.once='{ en: ["b"], ru: ["и"] }',
                  @shortkey='addTodo(true)'
                )
                  v-icon list
              span {{ $t("breakdownInfo") }}
            v-btn.ma-0(
              text,
              icon,
              @click='completeTodo()',
              :loading='loading',
              @shortkey='completeTodo(true)'
            )
              v-icon done
      v-list-item-content.text-center.mt-4(
        v-if='!todo && !loading && !todoUpdating && todosCount > 0'
      )
        span.display-3 🎉
        span.headline {{ $t("clear.congratulations") }}
        span.body-1 {{ $t("clear.text") }}
      v-list-item-content.text-center.mt-4(
        v-if='!todo && !loading && !todoUpdating && todosCount === 0'
      )
        span.display-3 🐝
        span.headline {{ $t("empty.action") }}
        span.body-1 {{ $t("empty.text") }}
  DeleteTodo(:todo='todoDeleted')
  AddTodo
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Todo } from '@/models/Todo'
import { getTodos, editTodo } from '@/utils/api'
import TodoText from '@/components/TodoText.vue'
import DeleteTodo from '@/components/DeleteTodo.vue'
import AddTodo from '@/components/AddTodo.vue'
import { Watch } from 'vue-property-decorator'
import * as api from '@/utils/api'
import { decrypt } from '@/utils/encryption'
import { i18n } from '@/plugins/i18n'
import { playSound, Sounds } from '@/utils/sounds'
import { namespace } from 'vuex-class'
import { User } from '@/models/User'
import { alertError } from '@/utils/alertError'
import { serverBus } from '@/main'

const UserStore = namespace('UserStore')
const AppStore = namespace('AppStore')

@Component({
  components: {
    TodoText,
    DeleteTodo,
    AddTodo,
  },
})
export default class CurrentTodo extends Vue {
  @UserStore.State user?: User
  @AppStore.State dark!: boolean

  showCompleted = false
  todo: Todo | null = null
  incompleteTodosCount = 0
  todosCount = 0

  loading = false

  todoEdited: Partial<Todo> | null = null
  todoDeleted: Todo | null = null

  get text() {
    if (this.todo?.encrypted) {
      return (
        decrypt(this.todo?.text, true) || i18n.t('encryption.errorDecrypting')
      )
    } else {
      return this.todo?.text
    }
  }

  get errorDecrypting() {
    if (this.todo?.encrypted) {
      return !decrypt(this.todo?.text, true)
    } else {
      return false
    }
  }

  get progress() {
    return this.todosCount === 0
      ? 0
      : (
          ((this.todosCount - this.incompleteTodosCount) / this.todosCount) *
          100
        ).toFixed(0)
  }

  beforeMount() {
    this.updateTodo()
  }

  addTodo() {
    serverBus.$emit('addTodoRequested', undefined, this.todo)
  }

  todoUpdating = false
  async updateTodo() {
    const user = this.user
    if (!user) {
      return
    }
    this.todoUpdating = true
    try {
      const fetched = await api.getCurrentTodo(user)
      this.todo = fetched.todo || null
      this.incompleteTodosCount = fetched.incompleteTodosCount
      this.todosCount = fetched.todosCount
    } catch (err) {
      alertError(err)
    } finally {
      this.todoUpdating = false
    }
  }

  async completeTodo() {
    const user = this.user
    if (!user) {
      return
    }
    if (!this.todo) {
      return
    }
    this.loading = true
    try {
      await api.completeTodo(user, this.todo)
      if (this.todo.frog) {
        await playSound(Sounds.frogDone)
      } else {
        await playSound(Sounds.taskDone)
      }
      this.updateTodo()
    } catch (err) {
      alertError(err)
    } finally {
      this.loading = false
    }
  }

  async deleteTodo() {
    this.todoDeleted = this.todo ? { ...this.todo } : null
  }

  async skipTodo() {
    const user = this.user
    if (!user) {
      return
    }
    if (!this.todo) {
      return
    }
    this.loading = true
    try {
      await api.skipTodo(user, this.todo)
      this.updateTodo()
    } catch (err) {
      alertError(err)
    } finally {
      this.loading = false
    }
  }

  cleanTodo(needsReload = true) {
    this.todoEdited = null
    if (needsReload) {
      this.updateTodo()
    }
  }

  requestDelete() {
    this.deleteTodo()
  }
}
</script>
