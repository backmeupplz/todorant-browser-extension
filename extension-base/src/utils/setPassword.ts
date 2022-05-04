import { getModule } from 'vuex-module-decorators'
import { browser } from 'webextension-polyfill-ts'
import store from '@/store'
import UserStore from '@/store/modules/UserStore'

export async function setPassword() {
  const appUrl = 'https://todorant.com'
  const cookie = await browser.cookies.get({ url: appUrl, name: 'password' })
  if (!cookie) return
  const password = cookie.value
  getModule(UserStore, store).setPassword(password)
}
