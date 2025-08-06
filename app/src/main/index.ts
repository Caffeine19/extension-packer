import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getPrimaryInstalledExtensions } from './vscodeExtensions'
import {
  getExtensionPacks,
  createExtensionPack,
  updateExtensionPack,
  addExtensionToPack,
  removeExtensionFromPack,
  buildExtensionPack
} from './extensionPacks'
import {
  getIgnoredExtensions,
  addToIgnoredList,
  removeFromIgnoredList,
  isExtensionIgnored,
  clearIgnoredExtensions
} from './ignoredExtensions'

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

  // IPC handlers
  ipcMain.on('ping', () => console.log('pong'))

  // Handle getting primary VS Code extensions only
  ipcMain.handle('get-primary-extensions', async () => {
    try {
      const extensions = await getPrimaryInstalledExtensions()
      return { success: true, data: extensions }
    } catch (error) {
      console.error('Failed to get primary extensions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle getting extension packs
  ipcMain.handle('get-extension-packs', async () => {
    try {
      const packs = await getExtensionPacks()
      return { success: true, data: packs }
    } catch (error) {
      console.error('Failed to get extension packs:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle creating extension pack
  ipcMain.handle(
    'create-extension-pack',
    async (_, packName: string, displayName: string, description: string, extensions: string[]) => {
      try {
        const result = await createExtensionPack(packName, displayName, description, extensions)
        return { success: result, data: result }
      } catch (error) {
        console.error('Failed to create extension pack:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  // Handle updating extension pack
  ipcMain.handle(
    'update-extension-pack',
    async (
      _,
      packName: string,
      updates: { displayName?: string; description?: string; extensionPack?: string[] }
    ) => {
      try {
        const result = await updateExtensionPack(packName, updates)
        return { success: result, data: result }
      } catch (error) {
        console.error('Failed to update extension pack:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  // Handle adding extension to pack
  ipcMain.handle('add-extension-to-pack', async (_, packName: string, extensionId: string) => {
    console.log('🚀 ~ index.ts:120 ~ packName:', packName, extensionId)
    try {
      const result = await addExtensionToPack(packName, extensionId)
      return { success: result, data: result }
    } catch (error) {
      console.error('Failed to add extension to pack:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle removing extension from pack
  ipcMain.handle('remove-extension-from-pack', async (_, packName: string, extensionId: string) => {
    try {
      const result = await removeExtensionFromPack(packName, extensionId)
      return { success: result, data: result }
    } catch (error) {
      console.error('Failed to remove extension from pack:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle building extension pack
  ipcMain.handle('build-extension-pack', async (_, packName: string) => {
    try {
      const result = await buildExtensionPack(packName)
      return result
    } catch (error) {
      console.error('Failed to build extension pack:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Handle getting ignored extensions
  ipcMain.handle('get-ignored-extensions', async () => {
    try {
      const ignoredExtensions = await getIgnoredExtensions()
      return { success: true, data: ignoredExtensions }
    } catch (error) {
      console.error('Failed to get ignored extensions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle adding extension to ignored list
  ipcMain.handle('add-to-ignored-list', async (_, extensionId: string) => {
    try {
      const result = await addToIgnoredList(extensionId)
      return { success: result, data: result }
    } catch (error) {
      console.error('Failed to add extension to ignored list:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle removing extension from ignored list
  ipcMain.handle('remove-from-ignored-list', async (_, extensionId: string) => {
    try {
      const result = await removeFromIgnoredList(extensionId)
      return { success: result, data: result }
    } catch (error) {
      console.error('Failed to remove extension from ignored list:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle checking if extension is ignored
  ipcMain.handle('is-extension-ignored', async (_, extensionId: string) => {
    try {
      const isIgnored = await isExtensionIgnored(extensionId)
      return { success: true, data: isIgnored }
    } catch (error) {
      console.error('Failed to check if extension is ignored:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Handle clearing all ignored extensions
  ipcMain.handle('clear-ignored-extensions', async () => {
    try {
      const result = await clearIgnoredExtensions()
      return { success: result, data: result }
    } catch (error) {
      console.error('Failed to clear ignored extensions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

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
