import * as api from '@/utils/api'
import { setTheme } from '@/utils/setTheme'
import { setPassword } from '@/utils/setPassword'
import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import UserStore from '@/store/modules/UserStore'
import DelegationStore from '@/store/modules/DelegationStore'
import { browser } from 'webextension-polyfill-ts'

export async function login() {
  const appUrl = 'https://todorant.com'
  const cookie = await browser.cookies.get({ url: appUrl, name: 'token' })
  if (!cookie) {
    getModule(UserStore, store).setUser({} as any)
    return
  }
  const user = await api.loginToken(cookie.value)
  getModule(UserStore, store).setUser(user)
  setTheme()
  setPassword()
}
