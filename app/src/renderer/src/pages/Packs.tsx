import type { Component } from 'solid-js'
import { Show, For } from 'solid-js'
import { usePackStore } from '../stores/pack'
import PackCard from '../components/PackCard'

const Packs: Component = () => {
  const {
    extensionPacks,
    packLoading,
    filteredExtensionPacks,
    packSearchQuery,
    handleGetExtensionPacks,
    handlePackSearchInput,
    clearPackSearch
  } = usePackStore()

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <main class="flex-1 overflow-auto p-6">
        <div class="actions mb-4">
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
                      <h3 class="text-lg font-medium text-gray-900 mb-2">
                        No extension packs found
                      </h3>
                      <p class="text-gray-500">
                        Click "Load Extension Packs" to scan for extension packs in your workspace
                      </p>
                    </div>
                  }
                >
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                      No packs match your search
                    </h3>
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
              <For each={filteredExtensionPacks()}>{(pack) => <PackCard pack={pack} />}</For>
            </div>
          </Show>
        </div>
      </main>
    </div>
  )
}

export default Packs
