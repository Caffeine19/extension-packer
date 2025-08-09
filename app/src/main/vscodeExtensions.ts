import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import type { InstalledExtension } from '@shared/extension'

// Helper function to convert icon file to base64 data URL
async function getIconDataUrl(iconPath: string): Promise<string | undefined> {
  try {
    const iconData = await fs.readFile(iconPath)
    const ext = path.extname(iconPath).toLowerCase()
    let mimeType = 'image/png' // default

    switch (ext) {
      case '.png':
        mimeType = 'image/png'
        break
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg'
        break
      case '.svg':
        mimeType = 'image/svg+xml'
        break
      case '.gif':
        mimeType = 'image/gif'
        break
      case '.webp':
        mimeType = 'image/webp'
        break
    }

    return `data:${mimeType};base64,${iconData.toString('base64')}`
  } catch (error) {
    console.warn(`Failed to read icon file: ${iconPath}`, error)
    return undefined
  }
}

// copy from raycast/vscode extension, no need to modify this file
// @link https://github.com/raycast/extensions/blob/48e820c8fe382b16cf90f3ddea95e7e7e7819c3e/extensions/visual-studio-code-recent-projects/src/lib/vscode.ts

// VS Code extension metadata interfaces
interface ExtensionMetaRoot {
  identifier: ExtensionIdentifier
  version: string
  location: ExtensionLocation | string
  metadata?: ExtensionMetadata
}

interface ExtensionIdentifier {
  id: string
  uuid: string
}

interface ExtensionLocation {
  $mid: number
  fsPath: string
  path: string
  scheme: string
}

interface ExtensionMetadata {
  id: string
  publisherId?: string
  publisherDisplayName?: string
  targetPlatform?: string
  isApplicationScoped?: boolean
  updated?: boolean
  isPreReleaseVersion: boolean
  installedTimestamp?: number
  preRelease?: boolean
}

interface PackageJSONInfo {
  displayName?: string
  icon?: string
  preview?: boolean
}

// VS Code variants and their folder schemes
const buildSchemes: Record<string, string> = {
  'Visual Studio Code': 'vscode',
  'Visual Studio Code - Insiders': 'vscode-insiders',
  Cursor: 'cursor',
  VSCodium: 'vscode-oss',
  Positron: 'positron',
  Windsurf: 'windsurf'
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Extract NLS (National Language Support) variable from text like "%displayName%"
 */
function getNLSVariable(text: string | undefined): string | undefined {
  if (!text) return text
  const match = text.match(/%(.+)%/)
  return match ? match[1] : undefined
}

/**
 * Read and parse package.json for an extension to get display info
 */
async function getPackageJSONInfo(packagePath: string): Promise<PackageJSONInfo | undefined> {
  try {
    if (!(await fileExists(packagePath))) return undefined

    const packageData = await fs.readFile(packagePath, { encoding: 'utf-8' })
    const packageJSON = JSON.parse(packageData)

    let displayName = packageJSON.displayName as string | undefined
    const iconFilename = packageJSON.icon as string | undefined
    const folder = path.dirname(packagePath)

    // Handle NLS (localization) for display name
    const nlsVariable = getNLSVariable(displayName)
    if (nlsVariable && nlsVariable.length > 0) {
      const nlsFilename = path.join(folder, 'package.nls.json')
      try {
        if (await fileExists(nlsFilename)) {
          const nlsContent = await fs.readFile(nlsFilename, { encoding: 'utf-8' })
          const nlsJSON = JSON.parse(nlsContent)
          const displayNameNLS = nlsJSON[nlsVariable] as string | undefined
          if (displayNameNLS && displayNameNLS.length > 0) {
            displayName = displayNameNLS
          }
        }
      } catch {
        // Ignore NLS errors
      }
    }

    const preview = packageJSON.preview as boolean | undefined
    const iconPath = iconFilename ? path.join(folder, iconFilename) : undefined
    const icon = iconPath ? await getIconDataUrl(iconPath) : undefined

    return {
      displayName,
      icon,
      preview
    }
  } catch {
    return undefined
  }
}

/**
 * Get extensions for a specific VS Code build scheme
 */
async function getExtensionsForScheme(scheme: string): Promise<InstalledExtension[]> {
  const extensionsRootFolder = path.join(os.homedir(), `.${scheme}/extensions`)
  const extensionsManifestFilename = path.join(extensionsRootFolder, 'extensions.json')

  if (!(await fileExists(extensionsManifestFilename))) {
    return []
  }

  try {
    const data = await fs.readFile(extensionsManifestFilename, { encoding: 'utf-8' })
    const extensions = JSON.parse(data) as ExtensionMetaRoot[] | undefined

    if (!extensions || extensions.length === 0) {
      return []
    }

    const result: InstalledExtension[] = []

    for (const ext of extensions) {
      const extFsPath =
        typeof ext.location === 'string'
          ? path.join(extensionsRootFolder, ext.location)
          : (ext.location.fsPath ?? ext.location.path)

      const packageFilename = path.join(extFsPath, 'package.json')
      const pkgInfo = await getPackageJSONInfo(packageFilename)

      result.push({
        id: ext.identifier.id,
        name: pkgInfo?.displayName || ext.identifier.id,
        version: ext.version,
        preRelease: ext.metadata?.preRelease,
        icon: pkgInfo?.icon,
        updated: ext.metadata?.updated,
        fsPath: extFsPath,
        publisherId: ext.metadata?.publisherId,
        publisherDisplayName: ext.metadata?.publisherDisplayName,
        preview: pkgInfo?.preview,
        installedTimestamp: ext.metadata?.installedTimestamp
      })
    }

    return result
  } catch (error) {
    console.error(`Failed to read extensions for scheme ${scheme}:`, error)
    return []
  }
}

/**
 * Get all installed VS Code extensions from all detected editors
 */
export async function getInstalledExtensions(): Promise<{
  [buildName: string]: InstalledExtension[]
}> {
  const result: { [buildName: string]: InstalledExtension[] } = {}

  // Check each VS Code variant
  for (const [buildName, scheme] of Object.entries(buildSchemes)) {
    const extensions = await getExtensionsForScheme(scheme)
    if (extensions.length > 0) {
      result[buildName] = extensions
    }
  }

  return result
}

/**
 * Get installed extensions for the primary VS Code installation only
 */
export async function getPrimaryInstalledExtensions(): Promise<InstalledExtension[]> {
  return getExtensionsForScheme('vscode')
}
