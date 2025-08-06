import type { Component } from 'solid-js'
import { For, Show, createSignal, createMemo } from 'solid-js'
import ExtensionCard, { type ExtensionData, type ExtensionPack } from './ExtensionCard'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'

interface ExtensionListProps {
  extensions: ExtensionData[]
  title?: string
  showCount?: boolean
  availablePacks?: ExtensionPack[]
  onAddToPack?: (extensionId: string, packName: string) => void
  onToggleIgnore?: (extensionId: string, isIgnored: boolean) => void
}

const ExtensionList: Component<ExtensionListProps> = (props) => {
  const [showIgnored, setShowIgnored] = createSignal(true)
  const [searchQuery, setSearchQuery] = createSignal('')

  // Create debounced setter for better search performance
  const debouncedSetSearchQuery = createDebouncedSetter(setSearchQuery, 300)

  const filteredExtensions = createMemo(() => {
    let extensions = props.extensions

    // Filter by ignored status
    if (!showIgnored()) {
      extensions = extensions.filter(ext => !ext.isIgnored)
    }

    // Filter by search query using enhanced search
    const query = searchQuery().trim()
    if (query) {
      extensions = extensions.filter(ext => {
        const searchFields = [
          ext.name,
          ext.id,
          ext.publisherDisplayName || '',
          ext.publisherId || ''
        ]
        return searchMultipleFields(query, searchFields)
      })
    }

    return extensions
  })

  const ignoredCount = createMemo(() =>
    props.extensions.filter(ext => ext.isIgnored).length
  )

  const clearSearch = () => {
    setSearchQuery('')
  }

  // Handle input change with debouncing
  const handleSearchInput = (value: string) => {
    debouncedSetSearchQuery(value)
  }

  return (
    <div class="space-y-4">
      <Show when={props.title}>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold text-gray-800">{props.title}</h2>
            <Show when={ignoredCount() > 0}>
              <div class="flex items-center gap-2">
                <label class="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showIgnored()}
                    onChange={(e) => setShowIgnored(e.currentTarget.checked)}
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show ignored ({ignoredCount()})
                </label>
              </div>
            </Show>
          </div>
          <Show when={props.showCount}>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredExtensions().length} shown
              </span>
              <Show when={!showIgnored() && ignoredCount() > 0}>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {ignoredCount()} hidden
                </span>
              </Show>
              <Show when={searchQuery()}>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {filteredExtensions().length} of {props.extensions.length} found
                </span>
              </Show>
            </div>
          </Show>
        </div>
      </Show>

      {/* Search Bar */}
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search extensions by name, ID, or publisher..."
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Show>
      </div>

      <Show
        when={filteredExtensions().length > 0}
        fallback={
          <div class="text-center py-12 text-gray-500">
            <div class="text-4xl mb-4">📦</div>
            <Show
              when={searchQuery()}
              fallback={
                <Show
                  when={showIgnored()}
                  fallback={
                    <div>
                      <p class="text-lg font-medium">All extensions are ignored</p>
                      <p class="text-sm">Enable "Show ignored" to see ignored extensions.</p>
                    </div>
                  }
                >
                  <div>
                    <p class="text-lg font-medium">No extensions found</p>
                    <p class="text-sm">Try checking a different VS Code installation.</p>
                  </div>
                </Show>
              }
            >
              <div>
                <p class="text-lg font-medium">No extensions match your search</p>
                <p class="text-sm">Try adjusting your search terms or clearing the search.</p>
                <button
                  onClick={clearSearch}
                  class="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </Show>
          </div>
        }
      >
        <div class="grid gap-4">
          <For each={filteredExtensions()}>
            {(extension) => (
              <ExtensionCard
                extension={extension}
                availablePacks={props.availablePacks}
                onAddToPack={props.onAddToPack}
                onToggleIgnore={props.onToggleIgnore}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default ExtensionList
