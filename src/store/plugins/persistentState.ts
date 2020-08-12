import createPersistedState from 'vuex-persistedstate'

export default createPersistedState({
  paths: ['UserStore.user', 'UserStore.password', 'AppStore.language'],
})
