<template lang="pug">
    .d-flex.flex-column.justify-center.align-center
      v-btn(@click='googleAuth' color='#FFFFFF')
        img.google-button-img(
          src='/img/google.svg',
          height='18dp',
          width='18dp'
        )
        span Sign in with Google
      v-text-field(
        v-if='!!debug'
        label='Debug token login',
        v-model='debugToken',
        append-icon='send',
        @click:append='tokenAuth'
        )
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { namespace } from 'vuex-class'
import { User } from '@/models/User'
import { loginGoogle, loginToken } from '@/utils/api'

const UserStore = namespace('UserStore')

@Component({})
export default class LoginButtons extends Vue {
  @UserStore.Mutation setUser!: (user: User) => void
  @UserStore.State user?: User

  debugToken = ''

  get debug() {
    return !!process.env.VUE_APP_DEV
  }
  get googleClientId() {
    return process.env.VUE_APP_GOOGLE_CLIENT_ID
  }

  getGoogleAcessToken(data: string) {
    const url = new URL(data)
    const urlParams = new URLSearchParams(url.hash.slice(1))
    const params = Object.fromEntries(urlParams.entries())
    return params.access_token
  }
  created() {
    if (!this.googleClientId) {
      return
    }
    const redirectURL = chrome.identity.getRedirectURL('/google')
    const authParams = new URLSearchParams({
      client_id: this.googleClientId,
      response_type: 'token',
      redirect_uri: redirectURL,
      scope: 'profile email',
    })
    const authURL = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`
    chrome.identity.launchWebAuthFlow({ url: authURL }, async response => {
      if (!response) {
        return
      }
      const acessToken = this.getGoogleAcessToken(response)
      const user = await loginGoogle(acessToken)
      if (!user) {
        return
      }
      this.setUser(user)
    })
  }
  googleAuth() {
    if (!this.googleClientId) {
      return
    }
    const redirectURL = chrome.identity.getRedirectURL('/google')
    const authParams = new URLSearchParams({
      client_id: this.googleClientId,
      response_type: 'token',
      redirect_uri: redirectURL,
      scope: 'profile email',
    })
    const authURL = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`
    chrome.identity.launchWebAuthFlow(
      { url: authURL, interactive: true },
      async response => {
        if (!response) {
          return
        }
        const acessToken = this.getGoogleAcessToken(response)
        const user = await loginGoogle(acessToken)
        if (!user) {
          return
        }
        this.setUser(user)
      }
    )
  }
  async tokenAuth() {
    const user = await loginToken(this.debugToken)
    this.setUser(user)
  }
}
</script>

<style>
.google-button {
  background-color: white;
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.54) !important;
  size: 14px !important;
  font-family: 'Roboto-Medium' !important;
  flex-direction: row !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}
.google-button-img {
  margin-right: 24px !important;
}
</style>
