import type { Component } from 'solid-js'
import { createSignal, Show, For, onMount } from 'solid-js'
import ExtensionList from './components/ExtensionList'
import PackCard from './components/PackCard'
import type { ExtensionData } from './components/ExtensionCard'
import { ExtensionPack } from '@shared/pack'
import type { InstalledExtension } from '@shared/extension'

const App: Component = () => {
  const [activeTab, setActiveTab] = createSignal<'extensions' | 'packs'>('extensions')

  const [extensions, setExtensions] = createSignal<InstalledExtension[]>([])

  const [error, setError] = createSignal<string>('')

  const [extensionPacks, setExtensionPacks] = createSignal<ExtensionPack[]>([])

  const [extensionLoading, setExtensionLoading] = createSignal(false)

  const [packLoading, setPackLoading] = createSignal(false)

  const handleGetExtensions = async (): Promise<void> => {
    setExtensionLoading(true)
    setError('')
    try {
      const result = await window.api.getPrimaryExtensions()
      if (result.success && result.data) {
        setExtensions(result.data)
        console.log('Extensions result:', result)

        if (extensionPacks().length === 0) {
          await handleGetExtensionPacks()
        }
      } else {
        setError(result.msg || 'Failed to get extensions')
        setExtensions([])
      }
    } catch (error) {
      console.error('Failed to get extensions:', error)
      setError('Failed to get extensions')
      setExtensions([])
    } finally {
      setExtensionLoading(false)
    }
  }
  onMount(() => handleGetExtensions())

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
  onMount(() => handleGetExtensionPacks())

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
        </nav>
      </div>

      {/* Extensions Tab */}
      <Show when={activeTab() === 'extensions'}>
        <div class="actions mt-4">
          <div class="action">
            <button
              onClick={handleGetExtensions}
              disabled={extensionLoading()}
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extensionLoading() ? 'Loading...' : 'Get VS Code Extensions'}
            </button>
          </div>
        </div>

        <Show when={extensions().length > 0 || error()}>
          <div class="mt-8">
            <Show
              when={!error()}
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
                      <p class="text-red-700 text-sm mt-1">{error()}</p>
                    </div>
                  </div>
                </div>
              }
            >
              <ExtensionList
                extensions={extensions() as ExtensionData[]}
                title="VS Code Extensions"
                showCount={true}
                availablePacks={extensionPacks()}
                onAddToPack={handleAddExtensionToPack}
              />
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
          <Show
            when={extensionPacks().length > 0}
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
                <h3 class="text-lg font-medium text-gray-900 mb-2">No extension packs found</h3>
                <p class="text-gray-500">
                  Click "Load Extension Packs" to scan for extension packs in your workspace
                </p>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={extensionPacks()}>{(pack) => <PackCard pack={pack} />}</For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default App
