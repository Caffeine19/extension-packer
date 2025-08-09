import type { Component } from 'solid-js'
import { createSignal, Show, For, createMemo } from 'solid-js'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'

interface IgnoredExtensionsViewProps {
  ignoredExtensions: string[]
  onRemoveFromIgnored: (extensionId: string) => void
  onClearAll: () => void
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
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Ignored Extensions</h2>
          <p class="text-sm text-gray-600 mt-1">
            Extensions that will not be available for adding to extension packs
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {filteredIgnoredExtensions().length} shown
          </span>
          <Show when={searchQuery()}>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {filteredIgnoredExtensions().length} of {props.ignoredExtensions.length} found
            </span>
          </Show>
          <Show when={props.ignoredExtensions.length > 0}>
            <button
              onClick={handleClearAll}
              class="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </Show>
        </div>
      </div>

      {/* Search Bar */}
      <Show when={props.ignoredExtensions.length > 0}>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
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
            class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Show when={searchQuery()}>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={clearSearch}
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
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
      </Show>

      <Show
        when={filteredIgnoredExtensions().length > 0}
        fallback={
          <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h3 class="text-lg font-medium text-gray-900 mb-2">No ignored extensions</h3>
                  <p class="text-gray-500">
                    Extensions marked as ignored will appear here and won't be available for adding
                    to packs
                  </p>
                </div>
              }
            >
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No extensions match your search
                </h3>
                <p class="text-gray-500 mb-4">
                  Try adjusting your search terms or clearing the search.
                </p>
                <button
                  onClick={clearSearch}
                  class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </Show>
          </div>
        }
      >
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 class="text-sm font-medium text-gray-700">Ignored Extension IDs</h3>
          </div>
          <div class="divide-y divide-gray-200">
            <For each={filteredIgnoredExtensions()}>
              {(extensionId) => (
                <div class="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 font-mono">{extensionId}</p>
                  </div>
                  <button
                    onClick={() => props.onRemoveFromIgnored(extensionId)}
                    class="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    title="Remove from ignored list"
                  >
                    Remove
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Confirm Clear All Modal */}
      <Show when={showConfirmClear()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Clear All Ignored Extensions?</h3>
            <p class="text-sm text-gray-500 mb-6">
              This will remove all {props.ignoredExtensions.length} extensions from the ignored
              list. They will become available for adding to extension packs again.
            </p>
            <div class="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
