import type { Result } from './result'

export interface InstalledExtension {
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

export type GetPrimaryExtensions = () => Promise<Result<InstalledExtension[]>>

export type GetInstalledExtensions = () => Promise<Result<{ [buildName: string]: InstalledExtension[] }>>

export type GetIgnoredExtensions = () => Promise<Result<string[]>>

export type ToggleIgnoredExtension = (extensionId: string) => Promise<Result<boolean>>

export type ClearIgnoredExtensions = () => Promise<Result<void>>
