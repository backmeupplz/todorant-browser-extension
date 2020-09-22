import store from '@/store'
import { getModule } from 'vuex-module-decorators'
import SettingsStore from '@/store/modules/SettingsStore'

export async function playSound(audioName: string) {
  if (!getModule(SettingsStore, store).audioEnabled) {
    return
  }
  const audioFile = new Audio(audioName)
  audioFile.volume = 0.3
  return audioFile.play()
}

export enum Sounds {
  taskDone = 'audio/task_done.mp3',
  frogDone = 'audio/splat.mp3',
}
