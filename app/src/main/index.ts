import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getPrimaryInstalledExtensions, getInstalledExtensions } from './vscodeExtensions'
import {
  getExtensionPacks,
  createExtensionPack,
  updateExtensionPack,
  addExtensionToPack,
  removeExtensionFromPack,
  buildExtensionPack,
  uploadPackIcon,
  removePackIcon,
  deleteExtensionPack,
  installExtensionPack,
  uninstallExtensionPack,
  initPacksDirectory
} from './extensionPacks'
import { getIgnoredExtensions, toggleIgnoredExtension } from './ignoredExtensions'
import {
  AddExtensionToPack,
  BuildExtensionPack,
  CreateExtensionPack,
  GetExtensionPacks,
  RemoveExtensionFromPack,
  UpdateExtensionPack,
  UploadPackIcon,
  RemovePackIcon,
  DeleteExtensionPack,
  InstallExtensionPack,
  UninstallExtensionPack
} from '@shared/pack'
import type {
  GetPrimaryExtensions,
  GetInstalledExtensions,
  GetIgnoredExtensions,
  ToggleIgnoredExtension
} from '@shared/extension'
import { defineIPC, IPCChannel } from './utils/defineIPC'

// Register custom protocol for pack icons
protocol.registerSchemesAsPrivileged([
  { scheme: 'pack-icon', privileges: { bypassCSP: true, supportFetchAPI: true } }
])

function createWindow(): void {
  const vibrancyOptions: Electron.BrowserWindowConstructorOptions = {
    vibrancy: 'under-window',
    backgroundColor: '#00000000', // transparent hexadecimal or anything with transparency,
    visualEffectState: 'followWindow'
  }

  const customTitleBarOptions: Electron.BrowserWindowConstructorOptions = {
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#000000',
      height: 40
    },
    titleBarStyle: 'hidden'
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 760,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    trafficLightPosition: { x: 20, y: 10 },

    ...customTitleBarOptions,
    ...vibrancyOptions
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
app.whenReady().then(async () => {
  // Copy bundled packs to writable userData on first launch (production only)
  await initPacksDirectory()
  // Register protocol handler for pack icons
  protocol.handle('pack-icon', (request) => {
    const filePath = decodeURIComponent(request.url.replace('pack-icon://', ''))
    return net.fetch(pathToFileURL(filePath).href)
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.caffeinecat.extension-packer')

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
        await createExtensionPack(packName, displayName, description, extensions)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to create extension pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<UpdateExtensionPack>(
    ipcMain,
    IPCChannel.UPDATE_EXTENSION_PACK,
    async (_, packName, updates) => {
      try {
        await updateExtensionPack(packName, updates)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to update extension pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<AddExtensionToPack>(
    ipcMain,
    IPCChannel.ADD_EXTENSION_TO_PACK,
    async (_, packName, extensionId) => {
      console.log('🚀 ~ index.ts ~ add-extension-to-pack:', packName, extensionId)
      try {
        await addExtensionToPack(packName, extensionId)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to add extension to pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<RemoveExtensionFromPack>(
    ipcMain,
    IPCChannel.REMOVE_EXTENSION_FROM_PACK,
    async (_, packName, extensionId) => {
      try {
        await removeExtensionFromPack(packName, extensionId)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to remove extension from pack:', error)
        return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  defineIPC.handle<BuildExtensionPack>(
    ipcMain,
    IPCChannel.BUILD_EXTENSION_PACK,
    async (_, packName) => {
      try {
        const result = await buildExtensionPack(packName)
        return { success: true, data: { outputPath: result.outputPath } }
      } catch (error) {
        console.error('Failed to build extension pack:', error)
        return {
          success: false,
          msg: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  defineIPC.handle<UploadPackIcon>(ipcMain, IPCChannel.UPLOAD_PACK_ICON, async (_, packName) => {
    try {
      const result = await uploadPackIcon(packName)
      return { success: true, data: { iconPath: result.iconPath } }
    } catch (error) {
      // User cancelled is not a real error
      if (error instanceof Error && error.message === 'No file selected') {
        return { success: false, msg: 'No file selected' }
      }
      console.error('Failed to upload pack icon:', error)
      return {
        success: false,
        msg: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  defineIPC.handle<RemovePackIcon>(ipcMain, IPCChannel.REMOVE_PACK_ICON, async (_, packName) => {
    try {
      await removePackIcon(packName)
      return { success: true, data: true }
    } catch (error) {
      console.error('Failed to remove pack icon:', error)
      return {
        success: false,
        msg: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  defineIPC.handle<DeleteExtensionPack>(
    ipcMain,
    IPCChannel.DELETE_EXTENSION_PACK,
    async (_, packName) => {
      try {
        await deleteExtensionPack(packName)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to delete extension pack:', error)
        return {
          success: false,
          msg: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  defineIPC.handle<InstallExtensionPack>(
    ipcMain,
    IPCChannel.INSTALL_EXTENSION_PACK,
    async (_, packName) => {
      try {
        await installExtensionPack(packName)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to install extension pack:', error)
        return {
          success: false,
          msg: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  defineIPC.handle<UninstallExtensionPack>(
    ipcMain,
    IPCChannel.UNINSTALL_EXTENSION_PACK,
    async (_, packName) => {
      try {
        await uninstallExtensionPack(packName)
        return { success: true, data: true }
      } catch (error) {
        console.error('Failed to uninstall extension pack:', error)
        return {
          success: false,
          msg: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  // Handle ignored extensions
  defineIPC.handle<GetIgnoredExtensions>(ipcMain, IPCChannel.GET_IGNORED_EXTENSIONS, async () => {
    try {
      const data = await getIgnoredExtensions()
      return { success: true, data }
    } catch (error) {
      console.error('Failed to get ignored extensions:', error)
      return {
        success: false,
        msg: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  defineIPC.handle<ToggleIgnoredExtension>(
    ipcMain,
    IPCChannel.TOGGLE_IGNORED_EXTENSION,
    async (_, extensionId: string) => {
      try {
        const isNowIgnored = await toggleIgnoredExtension(extensionId)
        return { success: true, data: isNowIgnored }
      } catch (error) {
        console.error('Failed to toggle ignored extension:', error)
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
