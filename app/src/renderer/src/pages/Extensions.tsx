import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { useExtensionStore } from '../stores/extension'
import { usePackStore } from '../stores/pack'
import ExtensionList from '../components/ExtensionList'
import type { ExtensionData } from '../components/ExtensionCard'

const Extensions: Component = () => {
  const { extensions, error, extensionLoading, handleGetExtensions, handleToggleIgnore } =
    useExtensionStore()

  const { extensionPacks, handleAddExtensionToPack } = usePackStore()

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <main class="flex-1 overflow-auto p-6">
        <div class="actions mb-4">
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
          <div>
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
                onToggleIgnore={handleToggleIgnore}
              />
            </Show>
          </div>
        </Show>
      </main>
    </div>
  )
}

export default Extensions
