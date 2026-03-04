import { IpcMain } from 'electron'

export enum IPCChannel {
  PING = 'ping',

  GET_PRIMARY_EXTENSIONS = 'get-primary-extensions',
  GET_INSTALLED_EXTENSIONS = 'get-installed-extensions',

  GET_EXTENSION_PACKS = 'get-extension-packs',
  ADD_EXTENSION_TO_PACK = 'add-extension-to-pack',
  REMOVE_EXTENSION_FROM_PACK = 'remove-extension-from-pack',
  BUILD_EXTENSION_PACK = 'build-extension-pack',
  CREATE_EXTENSION_PACK = 'create-extension-pack',
  UPDATE_EXTENSION_PACK = 'update-extension-pack',

  UPLOAD_PACK_ICON = 'upload-pack-icon',
  REMOVE_PACK_ICON = 'remove-pack-icon',
  DELETE_EXTENSION_PACK = 'delete-extension-pack',
  INSTALL_EXTENSION_PACK = 'install-extension-pack',
  UNINSTALL_EXTENSION_PACK = 'uninstall-extension-pack',

  GET_IGNORED_EXTENSIONS = 'get-ignored-extensions',
  TOGGLE_IGNORED_EXTENSION = 'toggle-ignored-extension',
  CLEAR_IGNORED_EXTENSIONS = 'clear-ignored-extensions'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const on = <T extends (...args: any) => any>(
  ipcMain: IpcMain,
  channel: IPCChannel,
  handler: (event: Electron.IpcMainEvent, ...args: Parameters<T>) => ReturnType<T>
) => {
  return ipcMain.on(channel, handler)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handle = <T extends (...args: any) => any>(
  ipcMain: IpcMain,
  channel: IPCChannel,
  handler: (event: Electron.IpcMainInvokeEvent, ...args: Parameters<T>) => ReturnType<T>
) => {
  return ipcMain.handle(channel, handler)
}

export const defineIPC = {
  on,
  handle
}
