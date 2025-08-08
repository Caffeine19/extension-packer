import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getPrimaryInstalledExtensions, getInstalledExtensions } from './vscodeExtensions'
import {
  getExtensionPacks,
  createExtensionPack,
  updateExtensionPack,
  addExtensionToPack,
  removeExtensionFromPack,
  buildExtensionPack
} from './extension-packs'
import {
  AddExtensionToPack,
  BuildExtensionPack,
  CreateExtensionPack,
  GetExtensionPacks,
  RemoveExtensionFromPack,
  UpdateExtensionPack,
  type ExtensionPack
} from '@shared/pack'
import type { Result } from '@shared/result'
import type { GetPrimaryExtensions, GetInstalledExtensions } from '@shared/extension'
import { defineIPC, IPCChannel } from './utils/defineIPC'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  defineIPC.on<(message: string) => string>(ipcMain, IPCChannel.PING, (_, message) => {
    console.log('Received ping:', message)
    return 'PONG'
  })

  defineIPC.handle<GetPrimaryExtensions>(ipcMain, IPCChannel.GET_PRIMARY_EXTENSIONS, async () => {
    try {
      const extensions = await getPrimaryInstalledExtensions()
      return { success: true, data: extensions }
    } catch (error) {
      console.error('Failed to get primary extensions:', error)
      return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  defineIPC.handle<GetInstalledExtensions>(
    ipcMain,
    IPCChannel.GET_INSTALLED_EXTENSIONS,
    async () => {
      try {
        const extensions = await getInstalledExtensions()
        return { success: true, data: extensions }
      } catch (error) {
        console.error('Failed to get installed extensions:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<GetExtensionPacks>(ipcMain, IPCChannel.GET_EXTENSION_PACKS, async () => {
    try {
      const packs = await getExtensionPacks()
      return { success: true, data: packs }
    } catch (error) {
      console.error('Failed to get extension packs:', error)
      return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  defineIPC.handle<CreateExtensionPack>(
    ipcMain,
    IPCChannel.CREATE_EXTENSION_PACK,
    async (_, packName, displayName, description, extensions) => {
      try {
        const ok = await createExtensionPack(packName, displayName, description, extensions)
        return ok ? { success: true, data: true } : { success: false, msg: 'Create pack failed' }
      } catch (error) {
        console.error('Failed to create extension pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<UpdateExtensionPack>(
    ipcMain,
    IPCChannel.UPDATE_EXTENSION_PACK,
    async (
      _,
      packName: ExtensionPack['name'],
      updates: Partial<Pick<ExtensionPack, 'displayName' | 'description' | 'extensionPack'>>
    ): Promise<Result<boolean>> => {
      try {
        const ok = await updateExtensionPack(packName, updates)
        return ok ? { success: true, data: true } : { success: false, msg: 'Update pack failed' }
      } catch (error) {
        console.error('Failed to update extension pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<AddExtensionToPack>(
    ipcMain,
    IPCChannel.ADD_EXTENSION_TO_PACK,
    async (_, packName: ExtensionPack['name'], extensionId: string): Promise<Result<boolean>> => {
      console.log('🚀 ~ index.ts ~ add-extension-to-pack:', packName, extensionId)
      try {
        const ok = await addExtensionToPack(packName, extensionId)
        return ok ? { success: true, data: true } : { success: false, msg: 'Add extension failed' }
      } catch (error) {
        console.error('Failed to add extension to pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<RemoveExtensionFromPack>(
    ipcMain,
    IPCChannel.REMOVE_EXTENSION_FROM_PACK,
    async (_, packName: ExtensionPack['name'], extensionId: string): Promise<Result<boolean>> => {
      try {
        const ok = await removeExtensionFromPack(packName, extensionId)
        return ok
          ? { success: true, data: true }
          : { success: false, msg: 'Remove extension failed' }
      } catch (error) {
        console.error('Failed to remove extension from pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<BuildExtensionPack>(
    ipcMain,
    IPCChannel.BUILD_EXTENSION_PACK,
    async (_, packName: ExtensionPack['name']): Promise<Result<{ outputPath: string }>> => {
      try {
        const result = await buildExtensionPack(packName)
        if (result.success && result.outputPath) {
          return { success: true, data: { outputPath: result.outputPath } }
        }
        return { success: false, msg: result.error ?? 'Build failed' }
      } catch (error) {
        console.error('Failed to build extension pack:', error)
        return {
          success: false,
          msg: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
