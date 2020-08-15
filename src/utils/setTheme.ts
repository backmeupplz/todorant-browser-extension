import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import AppStore from '@/store/modules/AppStore'

export function setTheme() {
  const appUrl = process.env.VUE_APP_FRONTEND
  if (!appUrl) {
    throw new Error('Please, specify frontend url in .env')
  }
  chrome.cookies.get(
    { url: appUrl, name: 'dark' },
    (cookie: chrome.cookies.Cookie | null) => {
      if (!cookie) {
        return
      }
      //Parse string to boolean
      const theme = cookie.value === 'true' ? true : false
      getModule(AppStore, store).setDark(theme)
    }
  )
}
