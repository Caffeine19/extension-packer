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
  clearPackSearch,
  handlePackSearchInput
})
