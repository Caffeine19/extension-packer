import { ExtensionPack } from '@shared/pack'
import { createSignal, createMemo } from 'solid-js'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'

// Extension Pack State
const [extensionPacks, setExtensionPacks] = createSignal<ExtensionPack[]>([])
const [packLoading, setPackLoading] = createSignal(false)
const [packSearchQuery, setPackSearchQuery] = createSignal('')

// Create debounced setter for pack search
const debouncedSetPackSearchQuery = createDebouncedSetter(setPackSearchQuery, 300)

// Derived state for packs
const filteredExtensionPacks = createMemo(() => {
  const query = packSearchQuery().trim()
  if (!query) {
    return extensionPacks()
  }

  return extensionPacks().filter((pack) => {
    const searchFields = [
      pack.displayName,
      pack.description || '',
      pack.name,
      ...pack.extensionPack // Include all extension IDs in the pack
    ]
    return searchMultipleFields(query, searchFields)
  })
})

const packsCount = createMemo(() => extensionPacks().length)

// Pack handlers
const handleGetExtensionPacks = async (): Promise<void> => {
  setPackLoading(true)
  try {
    const result = await window.api.getExtensionPacks()
    if (result.success && Array.isArray(result.data)) {
      setExtensionPacks(result.data)
      console.log('Extension packs result:', result.data)
    } else {
      console.error('Failed to get extension packs:', result.msg)
      setExtensionPacks([])
    }
  } catch (error) {
    console.error('Failed to get extension packs:', error)
    setExtensionPacks([])
  } finally {
    setPackLoading(false)
  }
}

const handleAddExtensionToPack = async (packName: string, extensionId: string): Promise<void> => {
  try {
    const result = await window.api.addExtensionToPack(packName, extensionId)
    if (result.success) {
      // Refresh extension packs to show updated data
      await handleGetExtensionPacks()
      console.log(`Successfully added ${extensionId} to ${packName}`)
    } else {
      console.error('Failed to add extension to pack:', result.msg)
    }
  } catch (error) {
    console.error('Failed to add extension to pack:', error)
  }
}

const handleCreateExtensionPack = async (
  packName: string,
  displayName: string,
  description: string,
  extensions: string[]
): Promise<boolean> => {
  try {
    const result = await window.api.createExtensionPack(
      packName,
      displayName,
      description,
      extensions
    )
    if (result.success) {
      await handleGetExtensionPacks()
      return true
    } else {
      console.error('Failed to create extension pack:', result.msg)
      return false
    }
  } catch (error) {
    console.error('Failed to create extension pack:', error)
    return false
  }
}

const handleUpdateExtensionPack = async (
  packName: string,
  updates: { displayName?: string; description?: string }
): Promise<boolean> => {
  try {
    const result = await window.api.updateExtensionPack(packName, updates)
    if (result.success) {
      await handleGetExtensionPacks()
      return true
    } else {
      console.error('Failed to update extension pack:', result.msg)
      return false
    }
  } catch (error) {
    console.error('Failed to update extension pack:', error)
    return false
  }
}

const handleDeleteExtensionPack = async (packName: string): Promise<boolean> => {
  try {
    const result = await window.api.deleteExtensionPack(packName)
    if (result.success) {
      await handleGetExtensionPacks()
      return true
    } else {
      console.error('Failed to delete extension pack:', result.msg)
      return false
    }
  } catch (error) {
    console.error('Failed to delete extension pack:', error)
    return false
  }
}

const handleInstallExtensionPack = async (
  packName: string
): Promise<{ success: boolean; msg?: string }> => {
  try {
    const result = await window.api.installExtensionPack(packName)
    if (result.success) {
      return { success: true }
    } else {
      console.error('Failed to install extension pack:', result.msg)
      return { success: false, msg: result.msg }
    }
  } catch (error) {
    console.error('Failed to install extension pack:', error)
    return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const handleUninstallExtensionPack = async (
  packName: string
): Promise<{ success: boolean; msg?: string }> => {
  try {
    const result = await window.api.uninstallExtensionPack(packName)
    if (result.success) {
      return { success: true }
    } else {
      console.error('Failed to uninstall extension pack:', result.msg)
      return { success: false, msg: result.msg }
    }
  } catch (error) {
    console.error('Failed to uninstall extension pack:', error)
    return { success: false, msg: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const clearPackSearch = () => {
  setPackSearchQuery('')
}

// Handle pack search input with debouncing
const handlePackSearchInput = (value: string) => {
  debouncedSetPackSearchQuery(value)
}

export const usePackStore = () => ({
  // State
  extensionPacks,
  setExtensionPacks,
  packLoading,
  setPackLoading,
  packSearchQuery,
  setPackSearchQuery,

  // Derived state
  filteredExtensionPacks,
  packsCount,

  // Handlers
  handleGetExtensionPacks,
  handleAddExtensionToPack,
  handleCreateExtensionPack,
  handleUpdateExtensionPack,
  handleDeleteExtensionPack,
  handleInstallExtensionPack,
  handleUninstallExtensionPack,
  clearPackSearch,
  handlePackSearchInput
})
