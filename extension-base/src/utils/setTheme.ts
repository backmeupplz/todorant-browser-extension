import { browser } from 'webextension-polyfill-ts'
import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import AppStore from '@/store/modules/AppStore'

export async function setTheme() {
  const appUrl = 'https://todorant.com'
  const cookie = await browser.cookies.get({ url: appUrl, name: 'dark' })
  if (!cookie) {
    return
  }
  //Parse string to boolean
  const theme = cookie.value === 'true' ? true : false
  getModule(AppStore, store).setDark(theme)
}
