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

interface ExtensionResult {
  success: boolean
  data?: InstalledExtension[] | { [buildName: string]: InstalledExtension[] }
  error?: string
}

interface ExtensionAPI {
  getPrimaryExtensions: () => Promise<ExtensionResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ExtensionAPI
  }
}
