import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { app, dialog } from 'electron'
import { CUSTOM_EXTENSION_CATEGORY } from '@shared/pack'
import type { ExtensionPack } from '@shared/pack'
import { promisifyExec } from './utils/promisifyExec'

/**
 * Get the packs directory path for both development and production
 */
function getPacksDirectory(): string {
  // In development, use the relative path
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    return path.join(process.cwd(), '..', 'packs')
  }

  // In production, use userData so the directory is writable
  return path.join(app.getPath('userData'), 'packs')
}

/**
 * Initialize the packs directory in userData on first launch.
 * Copies the bundled packs from app resources to the writable userData location.
 */
export async function initPacksDirectory(): Promise<void> {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    return // Development uses the repo packs folder directly
  }

  const targetDir = path.join(app.getPath('userData'), 'packs')
  const exists = await fs
    .access(targetDir)
    .then(() => true)
    .catch(() => false)

  if (!exists) {
    const sourceDir = path.join(process.resourcesPath, 'packs')
    await fs.cp(sourceDir, targetDir, { recursive: true })
  }
}

/**
 * Get all extension packs from the packs directory
 */
export async function getExtensionPacks() {
  const packs: ExtensionPack[] = []

  const packsDir = getPacksDirectory()

  // Check if packs directory exists
  const exists = await fs
    .access(packsDir)
    .then(() => true)
    .catch(() => false)
  if (!exists) {
    throw new Error(`Packs directory not found: ${packsDir}`)
  }

  // Read all directories in packs folder
  const entries = await fs.readdir(packsDir, { withFileTypes: true })
  const packDirectories = entries.filter((entry) => entry.isDirectory())

  const failedPacks: Array<{ name: string; error: string }> = []

  // Process all packs in parallel
  const taskArr = packDirectories.map(async (dir) => {
    const packPath = path.join(packsDir, dir.name)
    const packageJsonPath = path.join(packPath, 'package.json')

    // Check if package.json exists
    await fs.access(packageJsonPath)

    // Read and parse package.json
    const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)

    // Validate that it's an extension pack
    if (!packageJson.extensionPack || !Array.isArray(packageJson.extensionPack)) {
      throw new Error(`Directory ${dir.name} is not a valid extension pack`)
    }

    return {
      name: packageJson.name || dir.name,
      displayName: packageJson.displayName || packageJson.name || dir.name,
      description: packageJson.description || '',
      version: packageJson.version || '0.0.0',
      extensionPack: packageJson.extensionPack,
      categories: packageJson.categories || [],
      engines: packageJson.engines,
      folderPath: packPath,
      icon: packageJson.icon ? `pack-icon://${path.join(packPath, packageJson.icon)}` : undefined
    }
  })

  const results = await Promise.allSettled(taskArr)

  // Separate successful and failed results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      packs.push(result.value)
    } else {
      failedPacks.push({
        name: packDirectories[index].name,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
      })
    }
  })

  // Throw custom error if any packs failed to load
  if (failedPacks.length > 0) {
    const failedPacksInfo = failedPacks.map((fp) => `${fp.name}: ${fp.error}`).join('; ')
    throw new Error(`Failed to load ${failedPacks.length} extension pack(s): ${failedPacksInfo}`)
  }

  return packs.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

/**
 * Get a specific extension pack by name
 */
export async function getExtensionPack(
  packName: ExtensionPack['name']
): Promise<ExtensionPack | null> {
  const packs = await getExtensionPacks()
  return packs.find((pack) => pack.name === packName) || null
}

/**
 * Create a new extension pack
 */
export async function createExtensionPack(
  packName: ExtensionPack['name'],
  displayName: ExtensionPack['displayName'],
  description: ExtensionPack['description'],
  extensions: ExtensionPack['extensionPack']
): Promise<void> {
  const packsDir = getPacksDirectory()
  const packDir = path.join(packsDir, packName)

  // Create pack directory
  await fs.mkdir(packDir, { recursive: true })

  // Create package.json
  const packageJson = {
    name: packName,
    displayName,
    description,
    version: '0.0.1',
    engines: {
      vscode: '^1.102.0'
    },
    categories: [CUSTOM_EXTENSION_CATEGORY],
    extensionPack: extensions
  }

  const packageJsonPath = path.join(packDir, 'package.json')
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

  // Create README.md
  const readmeContent = `# ${displayName}

${description}

## Extensions Included

${extensions.length > 0 ? extensions.map((ext) => `- ${ext}`).join('\n') : '- No extensions yet'}

## Installation

1. Copy this folder to your VS Code extensions directory
2. Restart VS Code
3. The extension pack will be available in the Extensions view
`

  const readmePath = path.join(packDir, 'README.md')
  await fs.writeFile(readmePath, readmeContent)
}

/**
 * Update an existing extension pack
 */
export async function updateExtensionPack(
  packName: ExtensionPack['name'],
  updates: Partial<Pick<ExtensionPack, 'displayName' | 'description' | 'extensionPack'>>
): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  const packageJsonPath = path.join(pack.folderPath, 'package.json')
  const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageContent)

  // Apply updates
  if (updates.displayName) packageJson.displayName = updates.displayName
  if (updates.description !== undefined) packageJson.description = updates.description
  if (updates.extensionPack) packageJson.extensionPack = updates.extensionPack

  // Write back to file
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

/**
 * Add an extension to an existing pack
 */
export async function addExtensionToPack(
  packName: ExtensionPack['name'],
  extensionId: string
): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  const packageJsonPath = path.join(pack.folderPath, 'package.json')
  const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageContent)

  // Check if extension is already in the pack
  if (packageJson.extensionPack.includes(extensionId)) {
    console.warn(`Extension ${extensionId} is already in pack ${packName}`)
    return // Not an error, just already exists
  }

  // Add the extension
  packageJson.extensionPack.push(extensionId)

  // Write back to file
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

/**
 * Remove an extension from an existing pack
 */
export async function removeExtensionFromPack(
  packName: ExtensionPack['name'],
  extensionId: string
): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  const packageJsonPath = path.join(pack.folderPath, 'package.json')
  const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageContent)

  // Remove the extension
  const index = packageJson.extensionPack.indexOf(extensionId)
  if (index > -1) {
    packageJson.extensionPack.splice(index, 1)
  }

  // Write back to file
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

/**
 * Build an extension pack - creates a .vsix file
 */
export async function buildExtensionPack(
  packName: ExtensionPack['name']
): Promise<{ outputPath: string }> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  // Build the pack using vsce.
  // Wrap in a login shell so that PATH includes nvm / Homebrew / system node
  // regardless of whether the app was launched from a terminal or the Dock.
  const rawCommand = `cd "${pack.folderPath}" && npx vsce package`
  const buildCommand =
    process.platform === 'darwin' || process.platform === 'linux'
      ? `/bin/sh -l -c ${JSON.stringify(rawCommand)}`
      : rawCommand

  console.log(`Building extension pack: ${buildCommand}`)
  const { stdout, stderr } = await promisifyExec(buildCommand)

  if (stderr && !stderr.includes('WARNING')) {
    throw new Error(`Build failed: ${stderr}`)
  }

  console.log('Build stdout:', stdout)

  // Find the output .vsix file
  const vsixFiles = await fs.readdir(pack.folderPath)
  const vsixFile = vsixFiles.find((file) => file.endsWith('.vsix'))

  if (!vsixFile) {
    throw new Error('No .vsix file found after build')
  }

  const outputPath = path.join(pack.folderPath, vsixFile)
  return { outputPath }
}

/**
 * Upload an icon image for an extension pack.
 * Opens a file dialog, copies the selected image to the pack folder, and updates package.json.
 */
export async function uploadPackIcon(
  packName: ExtensionPack['name']
): Promise<{ iconPath: string }> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  const result = await dialog.showOpenDialog({
    title: 'Select Pack Icon',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] }],
    properties: ['openFile']
  })

  if (result.canceled || result.filePaths.length === 0) {
    throw new Error('No file selected')
  }

  const sourcePath = result.filePaths[0]
  const ext = path.extname(sourcePath)
  const iconFileName = `icon${ext}`
  const destPath = path.join(pack.folderPath, iconFileName)

  // Copy the image file to the pack folder
  await fs.copyFile(sourcePath, destPath)

  // Update package.json with the icon field
  const packageJsonPath = path.join(pack.folderPath, 'package.json')
  const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageContent)
  packageJson.icon = iconFileName
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

  return { iconPath: `pack-icon://${destPath}` }
}

/**
 * Remove the icon from an extension pack.
 * Deletes the icon file from disk and removes the icon field from package.json.
 */
export async function removePackIcon(packName: ExtensionPack['name']): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  const packageJsonPath = path.join(pack.folderPath, 'package.json')
  const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageContent)

  if (packageJson.icon) {
    const iconPath = path.join(pack.folderPath, packageJson.icon)
    try {
      await fs.unlink(iconPath)
    } catch {
      // Icon file may already be missing, that's fine
    }
    delete packageJson.icon
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }
}

/**
 * Delete an extension pack by removing its entire folder.
 */
export async function deleteExtensionPack(packName: ExtensionPack['name']): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  await fs.rm(pack.folderPath, { recursive: true, force: true })
}

/**
 * Get the VS Code extensions directory path.
 */
function getVSCodeExtensionsDir(): string {
  return path.join(os.homedir(), '.vscode', 'extensions')
}

/**
 * Install an extension pack into VS Code.
 * Builds a .vsix file and installs it via the `code` CLI.
 */
export async function installExtensionPack(packName: ExtensionPack['name']): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  // Build the vsix first
  const { outputPath } = await buildExtensionPack(packName)

  // Install via code CLI (wrap in login shell so PATH includes the `code` binary)
  const rawInstallCommand = `code --install-extension "${outputPath}" --force`
  const installCommand =
    process.platform === 'darwin' || process.platform === 'linux'
      ? `/bin/sh -l -c ${JSON.stringify(rawInstallCommand)}`
      : rawInstallCommand
  console.log(`Installing extension pack: ${installCommand}`)

  const { stderr } = await promisifyExec(installCommand)
  if (
    stderr &&
    !stderr.includes('Installing extensions') &&
    !stderr.includes('was successfully installed')
  ) {
    // code CLI prints progress to stderr, only throw on real errors
    if (stderr.includes('error') || stderr.includes('Error')) {
      throw new Error(`Install failed: ${stderr}`)
    }
  }

  // Clean up the vsix file after install
  try {
    await fs.unlink(outputPath)
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Uninstall an extension pack from VS Code.
 * Per https://github.com/microsoft/vscode/issues/169109:
 * 1. Delete the extension folder from ~/.vscode/extensions/
 * 2. Remove the entry from ~/.vscode/extensions/extensions.json
 */
export async function uninstallExtensionPack(packName: ExtensionPack['name']): Promise<void> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    throw new Error(`Extension pack ${packName} not found`)
  }

  const extensionsDir = getVSCodeExtensionsDir()
  const extensionsJsonPath = path.join(extensionsDir, 'extensions.json')

  // Read extensions.json to find the installed pack
  let extensionsJson: Array<{
    identifier: { id: string }
    location?: { fsPath?: string; path?: string } | string
    [key: string]: unknown
  }> = []

  try {
    const data = await fs.readFile(extensionsJsonPath, 'utf-8')
    extensionsJson = JSON.parse(data)
  } catch {
    throw new Error('Could not read VS Code extensions.json')
  }

  // Find the entry matching this pack by identifier id
  // Extension packs typically have identifier like "undefined_publisher.<packName>"
  // or the publisher.packName format
  const entryIndex = extensionsJson.findIndex((entry) => {
    const id = entry.identifier?.id?.toLowerCase() || ''
    return id === packName.toLowerCase() || id.endsWith(`.${packName.toLowerCase()}`)
  })

  if (entryIndex === -1) {
    throw new Error(`Extension pack "${packName}" is not installed in VS Code`)
  }

  const entry = extensionsJson[entryIndex]

  // Determine the installed folder path
  let installedFolderPath: string | undefined
  if (typeof entry.location === 'string') {
    installedFolderPath = path.join(extensionsDir, entry.location)
  } else if (entry.location?.fsPath) {
    installedFolderPath = entry.location.fsPath
  } else if (entry.location?.path) {
    installedFolderPath = entry.location.path
  }

  // 1. Delete the extension folder
  if (installedFolderPath) {
    try {
      await fs.rm(installedFolderPath, { recursive: true, force: true })
      console.log(`Deleted extension folder: ${installedFolderPath}`)
    } catch (error) {
      console.warn(`Could not delete extension folder: ${installedFolderPath}`, error)
    }
  }

  // 2. Remove the entry from extensions.json
  extensionsJson.splice(entryIndex, 1)
  await fs.writeFile(extensionsJsonPath, JSON.stringify(extensionsJson, null, '\t'))
  console.log(`Removed entry from extensions.json for: ${packName}`)
}
