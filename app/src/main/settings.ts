import { app } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import type { AppSettings } from '@shared/settings'
import { defaultSettings } from '@shared/settings'

const SETTINGS_FILE = 'settings.json'

function getSettingsFilePath(): string {
  return join(app.getPath('userData'), SETTINGS_FILE)
}

let cachedSettings: AppSettings | null = null

export async function loadSettings(): Promise<AppSettings> {
  if (cachedSettings) return cachedSettings

  try {
    const filePath = getSettingsFilePath()
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent) as AppSettings
    cachedSettings = { ...defaultSettings, ...data }
    return cachedSettings
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      cachedSettings = { ...defaultSettings }
      return cachedSettings
    }
    throw new Error(
      `Failed to load settings: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

async function saveSettings(settings: AppSettings): Promise<void> {
  const filePath = getSettingsFilePath()
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8')
  cachedSettings = settings
}

export async function getSettings(): Promise<AppSettings> {
  return await loadSettings()
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings()
  const updated = { ...current, ...updates }
  await saveSettings(updated)
  return updated
}
