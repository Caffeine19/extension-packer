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
    console.log('No ignored extensions file found, starting with empty list')
    return []
  }
}

/**
 * Save ignored extensions to file
 */
export async function saveIgnoredExtensions(ignoredExtensions: string[]): Promise<boolean> {
  try {
    const filePath = getIgnoredExtensionsFilePath()
    const data: IgnoredExtensionsData = {
      ignoredExtensions,
      lastUpdated: new Date().toISOString()
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to save ignored extensions:', error)
    return false
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
export async function addToIgnoredList(extensionId: string): Promise<boolean> {
  try {
    const ignoredExtensions = await loadIgnoredExtensions()

    // Check if already ignored
    if (ignoredExtensions.includes(extensionId)) {
      return true // Already ignored, no need to add again
    }

    ignoredExtensions.push(extensionId)
    return await saveIgnoredExtensions(ignoredExtensions)
  } catch (error) {
    console.error('Failed to add extension to ignored list:', error)
    return false
  }
}

/**
 * Remove an extension from the ignored list
 */
export async function removeFromIgnoredList(extensionId: string): Promise<boolean> {
  try {
    const ignoredExtensions = await loadIgnoredExtensions()
    const updatedList = ignoredExtensions.filter(id => id !== extensionId)

    // Only save if something was actually removed
    if (updatedList.length !== ignoredExtensions.length) {
      return await saveIgnoredExtensions(updatedList)
    }

    return true // Extension wasn't in the list anyway
  } catch (error) {
    console.error('Failed to remove extension from ignored list:', error)
    return false
  }
}

/**
 * Check if an extension is ignored
 */
export async function isExtensionIgnored(extensionId: string): Promise<boolean> {
  try {
    const ignoredExtensions = await loadIgnoredExtensions()
    return ignoredExtensions.includes(extensionId)
  } catch (error) {
    console.error('Failed to check if extension is ignored:', error)
    return false
  }
}

/**
 * Clear all ignored extensions
 */
export async function clearIgnoredExtensions(): Promise<boolean> {
  return await saveIgnoredExtensions([])
}
