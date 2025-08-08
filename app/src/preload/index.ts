import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ExtensionAPI } from '@shared/electronApi'
import { IPCChannel } from '../main/utils/defineIPC'

// Custom APIs for renderer
const api: ExtensionAPI = {
  getPrimaryExtensions: () => ipcRenderer.invoke(IPCChannel.GET_PRIMARY_EXTENSIONS),
  getInstalledExtensions: () => ipcRenderer.invoke(IPCChannel.GET_INSTALLED_EXTENSIONS),
  getExtensionPacks: () => ipcRenderer.invoke(IPCChannel.GET_EXTENSION_PACKS),
  createExtensionPack: (packName, displayName, description, extensions) =>
    ipcRenderer.invoke(
      IPCChannel.CREATE_EXTENSION_PACK,
      packName,
      displayName,
      description,
      extensions
    ),
  updateExtensionPack: (packName, updates) =>
    ipcRenderer.invoke(IPCChannel.UPDATE_EXTENSION_PACK, packName, updates),
  addExtensionToPack: (packName, extensionId) =>
    ipcRenderer.invoke(IPCChannel.ADD_EXTENSION_TO_PACK, packName, extensionId),
  removeExtensionFromPack: (packName, extensionId) =>
    ipcRenderer.invoke(IPCChannel.REMOVE_EXTENSION_FROM_PACK, packName, extensionId),
  buildExtensionPack: (packName) => ipcRenderer.invoke(IPCChannel.BUILD_EXTENSION_PACK, packName)
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
