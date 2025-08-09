import { InstalledExtension } from './extension'
import type { Result } from './result'

export interface ExtensionPack {
  name: string
  displayName: string
  description?: string
  version: string
  extensionPack: InstalledExtension['id'][]
  categories?: string[]
  engines?: {
    vscode: string
  }
  folderPath: string
}

export type CreateExtensionPack = (
  packName: ExtensionPack['name'],
  displayName: ExtensionPack['displayName'],
  description: ExtensionPack['description'],
  extensions: ExtensionPack['extensionPack']
) => Promise<Result<boolean>>

export type GetExtensionPacks = () => Promise<Result<ExtensionPack[]>>

export type UpdateExtensionPack = (
  packName: ExtensionPack['name'],
  updates: Partial<Pick<ExtensionPack, 'displayName' | 'description' | 'extensionPack'>>
) => Promise<Result<boolean>>

export type AddExtensionToPack = (
  packName: ExtensionPack['name'],
  extensionId: InstalledExtension['id']
) => Promise<Result<boolean>>

export type RemoveExtensionFromPack = (
  packName: ExtensionPack['name'],
  extensionId: InstalledExtension['id']
) => Promise<Result<boolean>>

export type BuildExtensionPack = (
  packName: ExtensionPack['name']
) => Promise<Result<{ outputPath: string }>>
