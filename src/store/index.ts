import UserStore from '@/store/modules/UserStore'
import TagsStore from '@/store/modules/TagsStore'
import AppStore from '@/store/modules/AppStore'
import SettingsStore from '@/store/modules/SettingsStore'
import persistentState from '@/store/plugins/persistentState'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    TagsStore,
    UserStore,
    AppStore,
    SettingsStore,
  },
  plugins: [persistentState],
})

export default store
