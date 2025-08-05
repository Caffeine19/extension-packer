import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getPrimaryExtensions: () => ipcRenderer.invoke('get-primary-extensions'),
  getInstalledExtensions: () => ipcRenderer.invoke('get-installed-extensions'),
  getExtensionPacks: () => ipcRenderer.invoke('get-extension-packs'),
  createExtensionPack: (
    packName: string,
    displayName: string,
    description: string,
    extensions: string[]
  ) => ipcRenderer.invoke('create-extension-pack', packName, displayName, description, extensions),
  updateExtensionPack: (
    packName: string,
    updates: { displayName?: string; description?: string; extensionPack?: string[] }
  ) => ipcRenderer.invoke('update-extension-pack', packName, updates),
  addExtensionToPack: (packName: string, extensionId: string) =>
    ipcRenderer.invoke('add-extension-to-pack', packName, extensionId),
  removeExtensionFromPack: (packName: string, extensionId: string) =>
    ipcRenderer.invoke('remove-extension-from-pack', packName, extensionId),
  buildExtensionPack: (packName: string) => ipcRenderer.invoke('build-extension-pack', packName)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
