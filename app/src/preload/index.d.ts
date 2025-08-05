import { ElectronAPI } from '@electron-toolkit/preload'

// Define the extension data types
interface InstalledExtension {
  id: string
  name: string
  version: string
  preRelease?: boolean
  icon?: string
  updated?: boolean
  fsPath: string
  publisherId?: string
  publisherDisplayName?: string
  preview?: boolean
  installedTimestamp?: number
}

interface ExtensionPack {
  name: string
  displayName: string
  description?: string
  version: string
  extensionPack: string[]
  categories?: string[]
  engines?: {
    vscode: string
  }
  folderPath: string
}

interface ExtensionResult {
  success: boolean
  data?: InstalledExtension[] | { [buildName: string]: InstalledExtension[] }
  error?: string
}

interface ExtensionPackResult {
  success: boolean
  data?: ExtensionPack[] | boolean
  error?: string
}

interface ExtensionAPI {
  getPrimaryExtensions: () => Promise<ExtensionResult>
  getInstalledExtensions: () => Promise<ExtensionResult>
  getExtensionPacks: () => Promise<ExtensionPackResult>
  createExtensionPack: (
    packName: string,
    displayName: string,
    description: string,
    extensions: string[]
  ) => Promise<ExtensionPackResult>
  updateExtensionPack: (
    packName: string,
    updates: { displayName?: string; description?: string; extensionPack?: string[] }
  ) => Promise<ExtensionPackResult>
  addExtensionToPack: (packName: string, extensionId: string) => Promise<ExtensionPackResult>
  removeExtensionFromPack: (packName: string, extensionId: string) => Promise<ExtensionPackResult>
  buildExtensionPack: (
    packName: string
  ) => Promise<{ success: boolean; outputPath?: string; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExtensionAPI
  }
}
