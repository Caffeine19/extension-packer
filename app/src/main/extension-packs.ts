import * as fs from 'fs/promises'
import * as path from 'path'

export interface ExtensionPack {
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

/**
 * Get all extension packs from the packs directory
 */
export async function getExtensionPacks(): Promise<ExtensionPack[]> {
  const packsDir = path.join(process.cwd(), '..', 'packs')

  try {
    // Check if packs directory exists
    const exists = await fs
      .access(packsDir)
      .then(() => true)
      .catch(() => false)
    if (!exists) {
      console.warn('Packs directory not found:', packsDir)
      return []
    }

    // Read all directories in packs folder
    const entries = await fs.readdir(packsDir, { withFileTypes: true })
    const packDirectories = entries.filter((entry) => entry.isDirectory())

    const packs: ExtensionPack[] = []

    for (const dir of packDirectories) {
      const packPath = path.join(packsDir, dir.name)
      const packageJsonPath = path.join(packPath, 'package.json')

      try {
        // Check if package.json exists
        await fs.access(packageJsonPath)

        // Read and parse package.json
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageContent)

        // Validate that it's an extension pack
        if (packageJson.extensionPack && Array.isArray(packageJson.extensionPack)) {
          packs.push({
            name: packageJson.name || dir.name,
            displayName: packageJson.displayName || packageJson.name || dir.name,
            description: packageJson.description || '',
            version: packageJson.version || '0.0.0',
            extensionPack: packageJson.extensionPack,
            categories: packageJson.categories || [],
            engines: packageJson.engines,
            folderPath: packPath
          })
        }
      } catch (error) {
        console.warn(`Failed to read package.json for pack ${dir.name}:`, error)
      }
    }

    return packs.sort((a, b) => a.displayName.localeCompare(b.displayName))
  } catch (error) {
    console.error('Failed to read extension packs:', error)
    return []
  }
}

/**
 * Get a specific extension pack by name
 */
export async function getExtensionPack(packName: string): Promise<ExtensionPack | null> {
  const packs = await getExtensionPacks()
  return packs.find((pack) => pack.name === packName) || null
}

/**
 * Create a new extension pack
 */
export async function createExtensionPack(
  packName: string,
  displayName: string,
  description: string = '',
  extensions: string[] = []
): Promise<boolean> {
  const packsDir = path.join(process.cwd(), '..', 'packs')
  const packDir = path.join(packsDir, packName)

  try {
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

    return true
  } catch (error) {
    console.error('Failed to create extension pack:', error)
    return false
  }
}

/**
 * Update an existing extension pack
 */
export async function updateExtensionPack(
  packName: string,
  updates: Partial<Pick<ExtensionPack, 'displayName' | 'description' | 'extensionPack'>>
): Promise<boolean> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    console.error(`Extension pack ${packName} not found`)
    return false
  }

  try {
    const packageJsonPath = path.join(pack.folderPath, 'package.json')
    const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)

    // Apply updates
    if (updates.displayName) packageJson.displayName = updates.displayName
    if (updates.description !== undefined) packageJson.description = updates.description
    if (updates.extensionPack) packageJson.extensionPack = updates.extensionPack

    // Write back to file
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

    return true
  } catch (error) {
    console.error('Failed to update extension pack:', error)
    return false
  }
}

/**
 * Add an extension to an existing pack
 */
export async function addExtensionToPack(packName: string, extensionId: string): Promise<boolean> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    console.error(`Extension pack ${packName} not found`)
    return false
  }

  try {
    const packageJsonPath = path.join(pack.folderPath, 'package.json')
    const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageContent)

    // Check if extension is already in the pack
    if (packageJson.extensionPack.includes(extensionId)) {
      console.warn(`Extension ${extensionId} is already in pack ${packName}`)
      return true // Not an error, just already exists
    }

    // Add the extension
    packageJson.extensionPack.push(extensionId)

    // Write back to file
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

    return true
  } catch (error) {
    console.error('Failed to add extension to pack:', error)
    return false
  }
}

/**
 * Remove an extension from an existing pack
 */
export async function removeExtensionFromPack(
  packName: string,
  extensionId: string
): Promise<boolean> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    console.error(`Extension pack ${packName} not found`)
    return false
  }

  try {
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

    return true
  } catch (error) {
    console.error('Failed to remove extension from pack:', error)
    return false
  }
}

/**
 * Build an extension pack - creates a .vsix file
 */
export async function buildExtensionPack(
  packName: string
): Promise<{ success: boolean; outputPath?: string; error?: string }> {
  const pack = await getExtensionPack(packName)
  if (!pack) {
    return { success: false, error: `Extension pack ${packName} not found` }
  }

  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    // Build the pack using vsce
    const buildCommand = `cd "${pack.folderPath}" && npx vsce package`

    console.log(`Building extension pack: ${buildCommand}`)
    const { stdout, stderr } = await execAsync(buildCommand)

    if (stderr && !stderr.includes('WARNING')) {
      console.error('Build stderr:', stderr)
      return { success: false, error: stderr }
    }

    console.log('Build stdout:', stdout)

    // Find the output .vsix file
    const vsixFiles = await fs.readdir(pack.folderPath)
    const vsixFile = vsixFiles.find((file) => file.endsWith('.vsix'))

    if (vsixFile) {
      const outputPath = path.join(pack.folderPath, vsixFile)
      return { success: true, outputPath }
    } else {
      return { success: false, error: 'No .vsix file found after build' }
    }
  } catch (error) {
    console.error('Failed to build extension pack:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown build error'
    }
  }
}
