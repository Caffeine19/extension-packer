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
  UPDATE_EXTENSION_PACK = 'update-extension-pack'
}

const on = <T extends (...args: any) => any>(
  ipcMain: IpcMain,
  channel: IPCChannel,
  handler: (event: Electron.IpcMainEvent, ...args: Parameters<T>) => ReturnType<T>
) => {
  return ipcMain.on(channel, handler)
}

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
