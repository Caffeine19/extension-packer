import type { Component } from 'solid-js'
import { createSignal, Show, For, createMemo, onMount } from 'solid-js'
import ExtensionList from './components/ExtensionList'
import PackCard from './components/PackCard'
import IgnoredExtensionsView from './components/IgnoredExtensionsView'
import type { ExtensionData } from './components/ExtensionCard'
import { searchMultipleFields, createDebouncedSetter } from './lib/searchUtils'

// Use the same interface as defined in preload
interface ExtensionPack {
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

const App: Component = () => {
  const [activeTab, setActiveTab] = createSignal<'extensions' | 'packs' | 'ignored'>('extensions')
  const [extensions, setExtensions] = createSignal<{
    success: boolean
    data?: ExtensionData[] | { [buildName: string]: ExtensionData[] }
    error?: string
  } | null>(null)
  const [extensionPacks, setExtensionPacks] = createSignal<ExtensionPack[]>([])
  const [ignoredExtensions, setIgnoredExtensions] = createSignal<string[]>([])
  const [loading, setLoading] = createSignal(false)
  const [packLoading, setPackLoading] = createSignal(false)
  const [packSearchQuery, setPackSearchQuery] = createSignal('')

  // Create debounced setter for pack search
  const debouncedSetPackSearchQuery = createDebouncedSetter(setPackSearchQuery, 300)

  const filteredExtensionPacks = createMemo(() => {
    const query = packSearchQuery().trim()
    if (!query) {
      return extensionPacks()
    }

    return extensionPacks().filter(pack => {
      const searchFields = [
        pack.displayName,
        pack.description || '',
        pack.name,
        ...pack.extensionPack // Include all extension IDs in the pack
      ]
      return searchMultipleFields(query, searchFields)
    })
  })

  const clearPackSearch = () => {
    setPackSearchQuery('')
  }

  // Handle pack search input with debouncing
  const handlePackSearchInput = (value: string) => {
    debouncedSetPackSearchQuery(value)
  }

  const handleGetExtensions = async (): Promise<void> => {
    setLoading(true)
    try {
      const result = await window.api.getPrimaryExtensions()

      // Load ignored extensions first
      const ignoredResult = await window.api.getIgnoredExtensions()
      const ignoredList = ignoredResult.success ? ignoredResult.data || [] : []
      setIgnoredExtensions(ignoredList)

      // Mark extensions as ignored in the extension data
      if (result.success && result.data) {
        if (Array.isArray(result.data)) {
          result.data = result.data.map(ext => ({
            ...ext,
            isIgnored: ignoredList.includes(ext.id)
          }))
        } else {
          // Handle object with build names
          const updatedData: { [buildName: string]: ExtensionData[] } = {}
          Object.entries(result.data).forEach(([buildName, exts]) => {
            updatedData[buildName] = exts.map(ext => ({
              ...ext,
              isIgnored: ignoredList.includes(ext.id)
            }))
          })
          result.data = updatedData
        }
      }

      setExtensions(result)
      console.log('Extensions result:', result)

      // Also load extension packs when extensions are loaded
      // so "Add to Pack" buttons are available
      if (extensionPacks().length === 0) {
        await handleGetExtensionPacks()
      }
    } catch (error) {
      console.error('Failed to get extensions:', error)
      setExtensions({ success: false, error: 'Failed to get extensions' })
    } finally {
      setLoading(false)
    }
  }

  const handleGetExtensionPacks = async (): Promise<void> => {
    setPackLoading(true)
    try {
      const result = await window.api.getExtensionPacks()
      if (result.success && Array.isArray(result.data)) {
        setExtensionPacks(result.data)
        console.log('Extension packs result:', result.data)
      } else {
        console.error('Failed to get extension packs:', result.error)
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
        console.error('Failed to add extension to pack:', result.error)
      }
    } catch (error) {
      console.error('Failed to add extension to pack:', error)
    }
  }

  const handleBuildPack = async (packName: string): Promise<void> => {
    try {
      const result = await window.api.buildExtensionPack(packName)
      if (result.success && result.outputPath) {
        // Show success message with output path
        alert(`Extension pack built successfully!\nOutput file: ${result.outputPath}`)
      } else {
        alert(`Failed to build extension pack: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to build extension pack:', error)
      alert(`Failed to build extension pack: ${error}`)
    }
  }

  const handleToggleIgnore = async (extensionId: string, isIgnored: boolean): Promise<void> => {
    try {
      const result = isIgnored
        ? await window.api.addToIgnoredList(extensionId)
        : await window.api.removeFromIgnoredList(extensionId)

      if (result.success) {
        // Update the ignored extensions list
        const newIgnoredList = isIgnored
          ? [...ignoredExtensions(), extensionId]
          : ignoredExtensions().filter(id => id !== extensionId)
        setIgnoredExtensions(newIgnoredList)

        // Update the extensions data to reflect the change
        const currentExtensions = extensions()
        if (currentExtensions?.success && currentExtensions.data) {
          if (Array.isArray(currentExtensions.data)) {
            const updatedData = currentExtensions.data.map(ext =>
              ext.id === extensionId ? { ...ext, isIgnored } : ext
            )
            setExtensions({ ...currentExtensions, data: updatedData })
          } else {
            // Handle object with build names
            const updatedData: { [buildName: string]: ExtensionData[] } = {}
            Object.entries(currentExtensions.data).forEach(([buildName, exts]) => {
              updatedData[buildName] = exts.map(ext =>
                ext.id === extensionId ? { ...ext, isIgnored } : ext
              )
            })
            setExtensions({ ...currentExtensions, data: updatedData })
          }
        }

        console.log(`Successfully ${isIgnored ? 'ignored' : 'unignored'} extension: ${extensionId}`)
      } else {
        console.error('Failed to toggle ignore status:', result.error)
      }
    } catch (error) {
      console.error('Failed to toggle ignore status:', error)
    }
  }

  const handleRemoveFromIgnored = async (extensionId: string): Promise<void> => {
    await handleToggleIgnore(extensionId, false)
  }

  const handleClearAllIgnored = async (): Promise<void> => {
    try {
      const result = await window.api.clearIgnoredExtensions()
      if (result.success) {
        setIgnoredExtensions([])

        // Update all extensions to not be ignored
        const currentExtensions = extensions()
        if (currentExtensions?.success && currentExtensions.data) {
          if (Array.isArray(currentExtensions.data)) {
            const updatedData = currentExtensions.data.map(ext => ({ ...ext, isIgnored: false }))
            setExtensions({ ...currentExtensions, data: updatedData })
          } else {
            // Handle object with build names
            const updatedData: { [buildName: string]: ExtensionData[] } = {}
            Object.entries(currentExtensions.data).forEach(([buildName, exts]) => {
              updatedData[buildName] = exts.map(ext => ({ ...ext, isIgnored: false }))
            })
            setExtensions({ ...currentExtensions, data: updatedData })
          }
        }

        console.log('Successfully cleared all ignored extensions')
      } else {
        console.error('Failed to clear ignored extensions:', result.error)
      }
    } catch (error) {
      console.error('Failed to clear ignored extensions:', error)
    }
  }

  // Auto-load extensions on component mount
  onMount(async () => {
    console.log('App mounted, auto-loading extensions...')
    await handleGetExtensions()
  })

  return (
    <div class="container mx-auto p-4">
      <div class="creator">Extension Packer</div>
      <p class="tip">Manage VS Code extensions and extension packs</p>

      {/* Tab Navigation */}
      <div class="mt-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('extensions')}
            class={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab() === 'extensions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            VS Code Extensions
          </button>
          <button
            onClick={() => setActiveTab('packs')}
            class={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab() === 'packs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Extension Packs
          </button>
          <button
            onClick={() => setActiveTab('ignored')}
            class={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab() === 'ignored'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ignored Extensions
            <Show when={ignoredExtensions().length > 0}>
              <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                {ignoredExtensions().length}
              </span>
            </Show>
          </button>
        </nav>
      </div>

      {/* Extensions Tab */}
      <Show when={activeTab() === 'extensions'}>
        <div class="actions mt-4">
          <div class="action">
            <button
              onClick={handleGetExtensions}
              disabled={loading()}
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading() ? 'Loading...' : 'Get VS Code Extensions'}
            </button>
          </div>
        </div>

        <Show when={extensions()}>
          <div class="mt-8">
            <Show
              when={extensions()?.success}
              fallback={
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="text-red-400 mr-3">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-red-800 font-medium">Error loading extensions</h3>
                      <p class="text-red-700 text-sm mt-1">{extensions()?.error}</p>
                    </div>
                  </div>
                </div>
              }
            >
              <Show when={Array.isArray(extensions()?.data)}>
                <ExtensionList
                  extensions={extensions()?.data as ExtensionData[]}
                  title="VS Code Extensions"
                  showCount={true}
                  availablePacks={extensionPacks()}
                  onAddToPack={handleAddExtensionToPack}
                  onToggleIgnore={handleToggleIgnore}
                />
              </Show>
              <Show when={!Array.isArray(extensions()?.data)}>
                <div class="space-y-6">
                  <For
                    each={Object.entries(
                      (extensions()?.data as { [key: string]: ExtensionData[] }) || {}
                    )}
                  >
                    {([buildName, exts]) => (
                      <ExtensionList
                        extensions={exts}
                        title={buildName}
                        showCount={true}
                        availablePacks={extensionPacks()}
                        onAddToPack={handleAddExtensionToPack}
                        onToggleIgnore={handleToggleIgnore}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </Show>
      </Show>

      {/* Extension Packs Tab */}
      <Show when={activeTab() === 'packs'}>
        <div class="actions mt-4">
          <div class="action">
            <button
              onClick={handleGetExtensionPacks}
              disabled={packLoading()}
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {packLoading() ? 'Loading...' : 'Load Extension Packs'}
            </button>
          </div>
        </div>

        <div class="mt-8">
          {/* Pack Search Bar */}
          <Show when={extensionPacks().length > 0}>
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800">Extension Packs</h2>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {filteredExtensionPacks().length} shown
                  </span>
                  <Show when={packSearchQuery()}>
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {filteredExtensionPacks().length} of {extensionPacks().length} found
                    </span>
                  </Show>
                </div>
              </div>

              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search packs by name, description, or contained extensions..."
                  value={packSearchQuery()}
                  onInput={(e) => handlePackSearchInput(e.currentTarget.value)}
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <Show when={packSearchQuery()}>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={clearPackSearch}
                      class="text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Clear search"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          <Show
            when={filteredExtensionPacks().length > 0}
            fallback={
              <div class="text-center py-12">
                <div class="text-gray-400 mb-4">
                  <svg
                    class="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <Show
                  when={packSearchQuery()}
                  fallback={
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">No extension packs found</h3>
                      <p class="text-gray-500">
                        Click "Load Extension Packs" to scan for extension packs in your workspace
                      </p>
                    </div>
                  }
                >
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No packs match your search</h3>
                    <p class="text-gray-500 mb-4">
                      Try adjusting your search terms or clearing the search.
                    </p>
                    <button
                      onClick={clearPackSearch}
                      class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                </Show>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={filteredExtensionPacks()}>
                {(pack) => (
                  <PackCard
                    pack={pack}
                    onEdit={(pack) => console.log('Edit pack:', pack)}
                    onDelete={(pack) => console.log('Delete pack:', pack)}
                    onBuild={(packName) => handleBuildPack(packName)}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>

      {/* Ignored Extensions Tab */}
      <Show when={activeTab() === 'ignored'}>
        <div class="mt-8">
          <IgnoredExtensionsView
            ignoredExtensions={ignoredExtensions()}
            onRemoveFromIgnored={handleRemoveFromIgnored}
            onClearAll={handleClearAllIgnored}
          />
        </div>
      </Show>
    </div>
  )
}

export default App
