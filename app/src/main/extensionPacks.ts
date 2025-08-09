import * as fs from 'fs/promises'
import * as path from 'path'
import { app } from 'electron'
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

  // In production, packs are bundled with the app
  return path.join(process.resourcesPath, 'packs')
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
      folderPath: packPath
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
    categories: ['Extension Packs'],
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

  // Build the pack using vsce
  const buildCommand = `cd "${pack.folderPath}" && npx vsce package`

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
