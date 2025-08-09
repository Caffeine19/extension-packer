import { createSignal, createMemo } from 'solid-js'
import type { InstalledExtension } from '@shared/extension'

// Extension State
const [extensions, setExtensions] = createSignal<InstalledExtension[]>([])
const [extensionLoading, setExtensionLoading] = createSignal(false)
const [ignoredExtensions, setIgnoredExtensions] = createSignal<string[]>([])
const [error, setError] = createSignal<string>('')

// Derived state for extensions
const extensionsCount = createMemo(() => extensions().length)
const ignoredExtensionsCount = createMemo(() => ignoredExtensions().length)

// Extension handlers
const handleGetExtensions = async (): Promise<void> => {
  setExtensionLoading(true)
  setError('')
  try {
    const result = await window.api.getPrimaryExtensions()
    if (result.success && result.data) {
      // Get ignored extensions to mark them
      const ignoredResult = await window.api.getIgnoredExtensions()
      const ignoredIds = ignoredResult.success && ignoredResult.data ? ignoredResult.data : []
      setIgnoredExtensions(ignoredIds)

      // Mark extensions as ignored
      const extensionsWithIgnored = result.data.map((ext) => ({
        ...ext,
        isIgnored: ignoredIds.includes(ext.id)
      }))

      setExtensions(extensionsWithIgnored)
      console.log('Extensions result:', result)
    } else {
      setError(result.msg || 'Failed to get extensions')
    }
  } catch (error) {
    console.error('Failed to get extensions:', error)
    setError('Failed to get extensions')
  } finally {
    setExtensionLoading(false)
  }
}

// Ignored extensions management
const handleGetIgnoredExtensions = async (): Promise<void> => {
  try {
    const result = await window.api.getIgnoredExtensions()
    if (result.success && result.data) {
      setIgnoredExtensions(result.data)
    } else {
      console.error('Failed to get ignored extensions:', result.msg)
      setIgnoredExtensions([])
    }
  } catch (error) {
    console.error('Failed to get ignored extensions:', error)
    setIgnoredExtensions([])
  }
}

const handleToggleIgnore = async (extensionId: string): Promise<void> => {
  try {
    const result = await window.api.toggleIgnoredExtension(extensionId)

    if (result.success) {
      // The toggle function returns the new ignored status
      const newIgnoredStatus = result.data

      // Update the extension's ignored status locally
      const updatedExtensions = extensions().map((ext) =>
        ext.id === extensionId ? { ...ext, isIgnored: newIgnoredStatus } : ext
      )
      setExtensions(updatedExtensions)

      // Update ignored extensions list
      if (newIgnoredStatus) {
        setIgnoredExtensions((ignored) => [...ignored, extensionId])
      } else {
        setIgnoredExtensions((ignored) => ignored.filter((id) => id !== extensionId))
      }

      console.log(`Extension ${extensionId} ignored status: ${newIgnoredStatus}`)
    } else {
      console.error('Failed to toggle ignored extension:', result.msg)
    }
  } catch (error) {
    console.error('Failed to toggle ignored extension:', error)
  }
}

const handleRemoveFromIgnored = async (extensionId: string): Promise<void> => {
  try {
    // Use toggle to remove from ignored list - it will return false if it was ignored and is now removed
    const result = await window.api.toggleIgnoredExtension(extensionId)
    if (result.success) {
      // Update local state
      setIgnoredExtensions((ignored) => ignored.filter((id) => id !== extensionId))

      // Update extension's ignored status if it's in the extensions list
      const updatedExtensions = extensions().map((ext) =>
        ext.id === extensionId ? { ...ext, isIgnored: false } : ext
      )
      setExtensions(updatedExtensions)

      console.log(`Removed ${extensionId} from ignored list`)
    } else {
      console.error('Failed to remove from ignored list:', result.msg)
    }
  } catch (error) {
    console.error('Failed to remove from ignored list:', error)
  }
}

const handleClearAllIgnored = async (): Promise<void> => {
  try {
    const result = await window.api.clearIgnoredExtensions()
    if (result.success) {
      setIgnoredExtensions([])

      // Update all extensions to not be ignored
      const updatedExtensions = extensions().map((ext) => ({ ...ext, isIgnored: false }))
      setExtensions(updatedExtensions)

      console.log('Cleared all ignored extensions')
    } else {
      console.error('Failed to clear ignored extensions:', result.msg)
    }
  } catch (error) {
    console.error('Failed to clear ignored extensions:', error)
  }
}

export const useExtensionStore = () => ({
  // State
  extensions,
  setExtensions,
  extensionLoading,
  setExtensionLoading,
  ignoredExtensions,
  setIgnoredExtensions,
  error,
  setError,

  // Derived state
  extensionsCount,
  ignoredExtensionsCount,

  // Handlers
  handleGetExtensions,
  handleGetIgnoredExtensions,
  handleToggleIgnore,
  handleRemoveFromIgnored,
  handleClearAllIgnored
})
