import * as api from '@/utils/api'
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
        chrome.tabs.create({ url: appUrl })
        throw new Error(
          `Token was not found. Please, make sure that you're loggined`
        )
      }
      const user = await api.loginToken(cookie.value)
      getModule(UserStore, store).setUser(user)
    }
  )
}
