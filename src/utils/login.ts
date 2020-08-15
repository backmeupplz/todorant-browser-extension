import * as api from '@/utils/api'
import { setTheme } from '@/utils/setTheme'
import { setPassword } from '@/utils/setPassword'
import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import UserStore from '@/store/modules/UserStore'

export function login() {
  const appUrl = process.env.VUE_APP_FRONTEND
  if (!appUrl) {
    throw new Error('Please, specify frontend url in .env')
  }
  chrome.cookies.get(
    { url: appUrl, name: 'token' },
    async (cookie: chrome.cookies.Cookie | null) => {
      if (!cookie) {
        getModule(UserStore, store).setUser(undefined)
        return
      }
      const user = await api.loginToken(cookie.value)
      getModule(UserStore, store).setUser(user)
    }
  )
  setTheme()
  setPassword()
}
