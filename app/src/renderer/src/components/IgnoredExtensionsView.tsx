import type { Component } from 'solid-js'
import { createSignal, Show, For, createMemo } from 'solid-js'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'

export interface ExtensionInfo {
  id: string
  name: string
  icon?: string
  publisherDisplayName?: string
}

interface IgnoredExtensionsViewProps {
  ignoredExtensions: string[]
  onRemoveFromIgnored: (extensionId: string) => void
  onClearAll: () => void
  extensionsMap?: Record<string, ExtensionInfo>
}

const IgnoredExtensionsView: Component<IgnoredExtensionsViewProps> = (props) => {
  const [showConfirmClear, setShowConfirmClear] = createSignal(false)
  const [searchQuery, setSearchQuery] = createSignal('')

  // Create debounced setter for better search performance
  const debouncedSetSearchQuery = createDebouncedSetter(setSearchQuery, 300)

  const filteredIgnoredExtensions = createMemo(() => {
    const query = searchQuery().trim()
    if (!query) {
      return props.ignoredExtensions
    }

    return props.ignoredExtensions.filter((extensionId) =>
      searchMultipleFields(query, [extensionId])
    )
  })

  const clearSearch = () => {
    setSearchQuery('')
  }

  // Handle search input with debouncing
  const handleSearchInput = (value: string) => {
    debouncedSetSearchQuery(value)
  }

  const handleClearAll = (): void => {
    if (props.ignoredExtensions.length === 0) return
    setShowConfirmClear(true)
  }

  const confirmClearAll = (): void => {
    props.onClearAll()
    setShowConfirmClear(false)
  }

  return (
    <div class="flex flex-col h-full">
      <div class="shrink-0 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-zinc-100">Ignored Extensions</h2>
            <p class="text-sm text-zinc-400 mt-1">
              Extensions that will not be available for adding to extension packs
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-sm font-medium">
              {filteredIgnoredExtensions().length} shown
            </span>
            <Show when={searchQuery()}>
              <span class="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium">
                {filteredIgnoredExtensions().length} of {props.ignoredExtensions.length} found
              </span>
            </Show>
          </div>
        </div>

        {/* Search Bar */}
        <Show when={props.ignoredExtensions.length > 0}>
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search ignored extensions by ID..."
                value={searchQuery()}
                onInput={(e) => handleSearchInput(e.currentTarget.value)}
                class="block w-full pl-10 pr-10 py-2 border border-zinc-700 rounded-md leading-5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:placeholder-zinc-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />
              <Show when={searchQuery()}>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={clearSearch}
                    class="text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    title="Clear search"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </Show>
            </div>
            <button
              onClick={handleClearAll}
              class="px-4 py-2 bg-zinc-700 text-white text-sm rounded hover:bg-zinc-500 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </Show>
      </div>

      <div class="flex-1 overflow-auto min-h-0 mt-6">
        <Show
          when={filteredIgnoredExtensions().length > 0}
          fallback={
            <div class="text-center py-12">
              <div class="text-zinc-500 mb-4">
                <svg
                  class="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              </div>
              <Show
                when={searchQuery()}
                fallback={
                  <div>
                    <h3 class="text-lg font-medium text-zinc-100 mb-2">No ignored extensions</h3>
                    <p class="text-zinc-400">
                      Extensions marked as ignored will appear here and won't be available for
                      adding to packs
                    </p>
                  </div>
                }
              >
                <div>
                  <h3 class="text-lg font-medium text-zinc-100 mb-2">
                    No extensions match your search
                  </h3>
                  <p class="text-zinc-400 mb-4">
                    Try adjusting your search terms or clearing the search.
                  </p>
                  <button
                    onClick={clearSearch}
                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              </Show>
            </div>
          }
        >
          <div class="bg-zinc-900 rounded-lg border border-zinc-800">
            <div class="px-4 py-3 border-b border-zinc-800 bg-gray-750">
              <h3 class="text-sm font-medium text-zinc-300">Ignored Extension IDs</h3>
            </div>
            <div class="divide-y divide-zinc-800">
              <For each={filteredIgnoredExtensions()}>
                {(extensionId) => {
                  const info = () => props.extensionsMap?.[extensionId]
                  return (
                    <div class="px-4 py-3 flex items-center justify-between hover:bg-zinc-800">
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <Show
                          when={info()?.icon}
                          fallback={
                            <div class="w-8 h-8 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center text-zinc-500 text-xs font-bold">
                              {(info()?.name || extensionId).charAt(0).toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            src={info()!.icon}
                            alt=""
                            class="w-8 h-8 rounded flex-shrink-0 object-cover"
                          />
                        </Show>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-zinc-100 truncate">
                            {info()?.name || extensionId}
                          </p>
                          <p class="text-xs text-zinc-500 font-mono truncate">{extensionId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => props.onRemoveFromIgnored(extensionId)}
                        class="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors flex-shrink-0"
                        title="Remove from ignored list"
                      >
                        Remove
                      </button>
                    </div>
                  )
                }}
              </For>
            </div>
          </div>
        </Show>
      </div>

      {/* Confirm Clear All Modal */}
      <Show when={showConfirmClear()}>
        <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div class="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border border-zinc-800">
            <h3 class="text-lg font-medium text-zinc-100 mb-4">Clear All Ignored Extensions?</h3>
            <p class="text-sm text-zinc-400 mb-6">
              This will remove all {props.ignoredExtensions.length} extensions from the ignored
              list. They will become available for adding to extension packs again.
            </p>
            <div class="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                class="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                class="flex-1 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-500 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default IgnoredExtensionsView
