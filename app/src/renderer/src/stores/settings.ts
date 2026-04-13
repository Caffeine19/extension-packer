import { createSignal } from 'solid-js'
import type { AppSettings } from '@shared/settings'
import { defaultSettings } from '@shared/settings'

const [settings, setSettings] = createSignal<AppSettings>(defaultSettings)

export const useSettingsStore = () => {
  const handleGetSettings = async () => {
    const result = await window.api.getSettings()
    if (result.success && result.data) {
      setSettings(result.data)
    }
  }

  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    const result = await window.api.updateSettings(updates)
    if (result.success && result.data) {
      setSettings(result.data)
    }
  }

  return {
    settings,
    handleGetSettings,
    handleUpdateSettings
  }
}
