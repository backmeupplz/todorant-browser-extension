import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import UserStore from '@/store/modules/UserStore'

export function setPassword() {
  const appUrl = process.env.VUE_APP_FRONTEND
  if (!appUrl) {
    throw new Error('Please, specify frontend url in .env')
  }
  chrome.cookies.get(
    { url: appUrl, name: 'password' },
    (cookie: chrome.cookies.Cookie | null) => {
      const password = cookie?.value
      getModule(UserStore, store).setPassword(password)
    }
  )
}
