import { getModule } from 'vuex-module-decorators'
import { browser } from 'webextension-polyfill-ts'
import store from '@/store'
import UserStore from '@/store/modules/UserStore'

export async function setPassword() {
  const appUrl = process.env.VUE_APP_FRONTEND
  if (!appUrl) {
    throw new Error('Please, specify frontend url in .env')
  }
  const cookie = await browser.cookies.get({ url: appUrl, name: 'password' })
  const password = cookie.value
  getModule(UserStore, store).setPassword(password)
}
