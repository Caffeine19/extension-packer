import type { Component } from 'solid-js'
import { Show, For, createMemo, createSignal } from 'solid-js'
import { usePackStore } from '../stores/pack'
import { useExtensionStore } from '../stores/extension'
import PackCard, { type ExtensionInfo } from '../components/PackCard'
import PackFormDialog from '../components/PackFormDialog'

const Packs: Component = () => {
  const {
    extensionPacks,
    packLoading,
    filteredExtensionPacks,
    packSearchQuery,
    handleGetExtensionPacks,
    handleCreateExtensionPack,
    handleUpdateExtensionPack,
    handleDeleteExtensionPack,
    handleInstallExtensionPack,
    handleUninstallExtensionPack,
    handlePackSearchInput,
    clearPackSearch
  } = usePackStore()

  const { extensions } = useExtensionStore()

  const [showDialog, setShowDialog] = createSignal(false)
  const [editingPack, setEditingPack] = createSignal<
    | {
        name: string
        keyword: string
        description: string
      }
    | undefined
  >(undefined)

  /**
   * Extract keyword from display name, e.g. "Custom Extension Pack(Java)" → "Java"
   */
  const extractKeyword = (displayName: string): string => {
    const match = displayName.match(/\((.+)\)\s*$/)
    return match ? match[1] : displayName
  }

  const handleOpenCreate = () => {
    setEditingPack(undefined)
    setShowDialog(true)
  }

  const handleOpenEdit = (pack: { name: string; displayName: string; description?: string }) => {
    setEditingPack({
      name: pack.name,
      keyword: extractKeyword(pack.displayName),
      description: pack.description || ''
    })
    setShowDialog(true)
  }

  const handleDelete = async (packName: string) => {
    await handleDeleteExtensionPack(packName)
  }

  // Build a lookup map from extension ID to basic info
  const extensionsMap = createMemo<Record<string, ExtensionInfo>>(() => {
    const map: Record<string, ExtensionInfo> = {}
    for (const ext of extensions()) {
      map[ext.id] = {
        id: ext.id,
        name: ext.name,
        icon: ext.icon,
        publisherDisplayName: ext.publisherDisplayName
      }
    }
    return map
  })

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      <div class="shrink-0 px-6 pt-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-zinc-100">Extension Packs</h2>
          <Show when={extensionPacks().length > 0}>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium">
                {filteredExtensionPacks().length} shown
              </span>
              <Show when={packSearchQuery()}>
                <span class="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium">
                  {filteredExtensionPacks().length} of {extensionPacks().length} found
                </span>
              </Show>
            </div>
          </Show>
        </div>

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
              placeholder="Search packs by name, description, or contained extensions..."
              value={packSearchQuery()}
              onInput={(e) => handlePackSearchInput(e.currentTarget.value)}
              class="block w-full pl-10 pr-10 py-2 border border-zinc-700 rounded-md leading-5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:placeholder-zinc-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
            <Show when={packSearchQuery()}>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={clearPackSearch}
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
            onClick={handleGetExtensionPacks}
            disabled={packLoading()}
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {packLoading() ? 'Loading...' : 'Reload'}
          </button>
          <button
            onClick={handleOpenCreate}
            class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-500 whitespace-nowrap flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create
          </button>
        </div>
      </div>

      <main class="flex-1 overflow-auto px-6 pb-6 pt-4">
        <div>
          <Show
            when={filteredExtensionPacks().length > 0}
            fallback={
              <div class="text-center py-12">
                <div class="text-zinc-500 mb-4">
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
                      <h3 class="text-lg font-medium text-zinc-100 mb-2">
                        No extension packs found
                      </h3>
                      <p class="text-zinc-400">
                        Click "Load Extension Packs" to scan for extension packs in your workspace
                      </p>
                    </div>
                  }
                >
                  <div>
                    <h3 class="text-lg font-medium text-zinc-100 mb-2">
                      No packs match your search
                    </h3>
                    <p class="text-zinc-400 mb-4">
                      Try adjusting your search terms or clearing the search.
                    </p>
                    <button
                      onClick={clearPackSearch}
                      class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
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
                    onIconUploaded={handleGetExtensionPacks}
                    extensionsMap={extensionsMap()}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onInstall={handleInstallExtensionPack}
                    onUninstall={handleUninstallExtensionPack}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
      </main>

      <PackFormDialog
        open={showDialog()}
        onClose={() => {
          setShowDialog(false)
          setEditingPack(undefined)
        }}
        onCreate={handleCreateExtensionPack}
        onUpdate={handleUpdateExtensionPack}
        editPack={editingPack()}
      />
    </div>
  )
}

export default Packs
