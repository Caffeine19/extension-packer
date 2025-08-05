import type { Component } from 'solid-js'
import { createSignal, Show, For } from 'solid-js'
import ExtensionList from './components/ExtensionList'
import type { ExtensionData } from './components/ExtensionCard'

const App: Component = () => {
  const [extensions, setExtensions] = createSignal<{
    success: boolean
    data?: ExtensionData[] | { [buildName: string]: ExtensionData[] }
    error?: string
  } | null>(null)
  const [loading, setLoading] = createSignal(false)

  const handleGetExtensions = async (): Promise<void> => {
    setLoading(true)
    try {
      const result = await window.api.getPrimaryExtensions()
      setExtensions(result)
      console.log('Extensions result:', result)
    } catch (error) {
      console.error('Failed to get extensions:', error)
      setExtensions({ success: false, error: 'Failed to get extensions' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div class="container mx-auto p-4">
      <div class="creator">Extension Packer</div>
      <p class="tip">Click the buttons below to test VS Code extension detection</p>
      <div class="actions">
        <div class="action mt-4">
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
                    <ExtensionList extensions={exts} title={buildName} showCount={true} />
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default App
