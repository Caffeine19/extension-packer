import { app } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

export interface IgnoredExtensionsData {
  ignoredExtensions: string[]
  lastUpdated: string
}

const IGNORED_EXTENSIONS_FILE = 'ignored-extensions.json'

/**
 * Get the path to the ignored extensions file
 */
function getIgnoredExtensionsFilePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, IGNORED_EXTENSIONS_FILE)
}

/**
 * Load ignored extensions from file
 */
export async function loadIgnoredExtensions(): Promise<string[]> {
  try {
    const filePath = getIgnoredExtensionsFilePath()
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data: IgnoredExtensionsData = JSON.parse(fileContent)
    return data.ignoredExtensions || []
  } catch (error) {
    // File doesn't exist or is corrupted, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw new Error(`Failed to load ignored extensions: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Save ignored extensions to file
 */
export async function saveIgnoredExtensions(ignoredExtensions: string[]): Promise<void> {
  try {
    const filePath = getIgnoredExtensionsFilePath()
    const data: IgnoredExtensionsData = {
      ignoredExtensions,
      lastUpdated: new Date().toISOString()
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    throw new Error(`Failed to save ignored extensions: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get all ignored extensions
 */
export async function getIgnoredExtensions(): Promise<string[]> {
  return await loadIgnoredExtensions()
}

/**
 * Add an extension to the ignored list
 */
export async function addToIgnoredList(extensionId: string): Promise<void> {
  const ignoredExtensions = await loadIgnoredExtensions()

  // Check if already ignored
  if (ignoredExtensions.includes(extensionId)) {
    return // Already ignored, no need to add again
  }

  ignoredExtensions.push(extensionId)
  await saveIgnoredExtensions(ignoredExtensions)
}

/**
 * Remove an extension from the ignored list
 */
export async function removeFromIgnoredList(extensionId: string): Promise<void> {
  const ignoredExtensions = await loadIgnoredExtensions()
  const updatedList = ignoredExtensions.filter(id => id !== extensionId)

  // Only save if something was actually removed
  if (updatedList.length !== ignoredExtensions.length) {
    await saveIgnoredExtensions(updatedList)
  }
}

/**
 * Check if an extension is ignored
 */
export async function isExtensionIgnored(extensionId: string): Promise<boolean> {
  const ignoredExtensions = await loadIgnoredExtensions()
  return ignoredExtensions.includes(extensionId)
}

/**
 * Clear all ignored extensions
 */
export async function clearIgnoredExtensions(): Promise<void> {
  await saveIgnoredExtensions([])
}

/**
 * Toggle an extension's ignored status
 */
export async function toggleIgnoredExtension(extensionId: string): Promise<boolean> {
  const ignoredExtensions = await loadIgnoredExtensions()
  const isCurrentlyIgnored = ignoredExtensions.includes(extensionId)

  if (isCurrentlyIgnored) {
    const updatedList = ignoredExtensions.filter(id => id !== extensionId)
    await saveIgnoredExtensions(updatedList)
    return false // Now not ignored
  } else {
    ignoredExtensions.push(extensionId)
    await saveIgnoredExtensions(ignoredExtensions)
    return true // Now ignored
  }
}
