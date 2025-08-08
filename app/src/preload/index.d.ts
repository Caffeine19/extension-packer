import { ElectronAPI } from '@electron-toolkit/preload'
import type { ExtensionAPI } from '@shared/electronApi'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExtensionAPI
  }
}
