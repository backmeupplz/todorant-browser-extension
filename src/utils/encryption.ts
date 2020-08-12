import { AES, enc } from 'crypto-js'
import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import UserStore from '@/store/modules/UserStore'

export function encrypt(str: string) {
  if (!getModule(UserStore, store).password) {
    return str
  } else {
    return _e(str, getModule(UserStore, store).password as string)
  }
}

export function decrypt(str: string, encrypted = false) {
  if (!getModule(UserStore, store).password && !encrypted) {
    return str
  } else {
    return !getModule(UserStore, store).password
      ? ''
      : _d(str, getModule(UserStore, store).password as string)
  }
}

export function _e(value: string, key: string) {
  return AES.encrypt(value, key).toString()
}

export function _d(value: string, key: string) {
  const bytes = AES.decrypt(value, key)
  return bytes.toString(enc.Utf8)
}
