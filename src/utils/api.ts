import axios from 'axios'
import { getModule } from 'vuex-module-decorators'
import { User } from '@/models/User'
import { Todo } from '@/models/Todo'
import { Tag } from '@/models/Tag'
import store from '@/store'
import TagsStore from '@/store/modules/TagsStore'
import UserStore from '@/store/modules/UserStore'
import AppStore from '@/store/modules/AppStore'

const base = process.env.VUE_APP_API

export async function loginGoogle(accessToken: string) {
  return (
    await axios.post(`${base}/login/extension/google`, {
      accessToken,
    })
  ).data as User
}

export async function loginToken(token: string) {
  return (await axios.post(`${base}/login/token`, { token })).data as User
}

export async function editTodo(user: User, todo: Todo) {
  const todoCopy = { ...todo, today: getToday() }
  if (
    (todo.date && todo.date.length !== 2) ||
    (todo.monthAndYear && todo.monthAndYear.length !== 7)
  ) {
    if (todo.date) {
      todoCopy.monthAndYear = todo.date.substr(0, 7)
      todoCopy.date = todo.date.substr(8)
    }
  }
  return axios.put(`${base}/todo/${todo._id}`, todoCopy, {
    headers: getHeaders(user),
  })
}

export async function completeTodo(user: User, todo: Todo) {
  return axios.put(
    `${base}/todo/${todo._id}/done`,
    {},
    {
      headers: getHeaders(user),
    }
  )
}

export async function getCurrentTodo(user: User) {
  const data = (
    await axios.get(`${base}/todo/current`, {
      headers: getHeaders(user),
      params: {
        date: getToday(),
      },
    })
  ).data as {
    todosCount: number
    incompleteTodosCount: number
    todo?: Todo
    state: UserStore
    tags: Tag[]
    points: number
  }
  getModule(UserStore, store).setUserStore(data.state)
  setSettingsFromServer(data.state)
  setTags(data.tags)
  return data
}

export async function skipTodo(user: User, todo: Todo) {
  return axios.put(
    `${base}/todo/${todo._id}/skip`,
    {},
    {
      headers: getHeaders(user),
    }
  )
}

export async function deleteTodo(todo: Todo) {
  const user = (store as any).state.UserStore.user
  if (!user) {
    throw new Error('No user')
  }
  return axios.delete(`${base}/todo/${todo._id}`, {
    headers: getHeaders(user),
  })
}

export async function getTodos(
  user: User,
  completed: boolean = false,
  skip: number,
  limit: number,
  hash?: string,
  queryString?: string,
  calendarView: boolean = false,
  period?: Date
) {
  const data = (
    await axios.get(`${base}/todo`, {
      headers: getHeaders(user),
      params: {
        completed,
        hash,
        skip,
        limit,
        today: period ? getStringFromDate(period) : getToday(),
        calendarView,
        date: getToday(),
        queryString,
      },
    })
  ).data as { todos: Todo[]; state: UserStore; tags: Tag[]; points: number }
  setSettingsFromServer(data.state)
  setTags(data.tags)
  return data.todos
}

function getHeaders(user: User) {
  if (user.token) {
    const password = getModule(UserStore, store).password
    return password ? { token: user.token, password } : { token: user.token }
  } else {
    return undefined
  }
}

export function getStringFromDate(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
}

export function getToday() {
  return getStringFromDate(new Date())
}

function setTags(tags: Tag[]) {
  getModule(TagsStore, store).setTags(
    tags.sort((a, b) => {
      return a.numberOfUses !== b.numberOfUses
        ? a.numberOfUses > b.numberOfUses
          ? -1
          : 1
        : a.tag < b.tag
        ? -1
        : 1
    })
  )
  const tagColors = tags.reduce((p, c) => {
    if (c.color) {
      p[c.tag] = c.color
    }
    return p
  }, {} as { [index: string]: string })
  getModule(TagsStore, store).setTagColors(tagColors)
}

function setSettingsFromServer(state: any) {
  const settings = state.settings
  const appStore = getModule(AppStore, store).setLanguage(settings.language)
}
