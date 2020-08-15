import * as api from '@/utils/api'
import { setTheme } from '@/utils/setTheme'
import { setPassword } from '@/utils/setPassword'
import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import UserStore from '@/store/modules/UserStore'
import { browser } from 'webextension-polyfill-ts'

export async function login() {
  const appUrl = process.env.VUE_APP_FRONTEND
  if (!appUrl) {
    throw new Error('Please, specify frontend url in .env')
  }
  const cookie = await browser.cookies.get({ url: appUrl, name: 'token' })
  if (!cookie) {
    getModule(UserStore, store).setUser(undefined)
    return
  }
  const user = await api.loginToken(cookie.value)
  getModule(UserStore, store).setUser(user)
  setTheme()
  setPassword()
}
