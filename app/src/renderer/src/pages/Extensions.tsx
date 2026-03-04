import type { Component } from 'solid-js'
import { Show, createSignal, createMemo } from 'solid-js'
import { useExtensionStore } from '../stores/extension'
import { usePackStore } from '../stores/pack'
import { CUSTOM_EXTENSION_CATEGORY } from '@shared/pack'
import ExtensionList from '../components/ExtensionList'
import type { ExtensionData } from '../components/ExtensionCard'

type ExtensionTab = 'all' | 'unpacked'

const Extensions: Component = () => {
  const { extensions, error, extensionLoading, handleGetExtensions, handleToggleIgnore } =
    useExtensionStore()

  const { extensionPacks, handleAddExtensionToPack } = usePackStore()

  const [activeTab, setActiveTab] = createSignal<ExtensionTab>('all')

  // Filter out custom extension packs (category: "Custom Extension") from the extensions list
  const filteredExtensions = createMemo(() => {
    return (extensions() as ExtensionData[]).filter(
      (ext) => !ext.categories?.includes(CUSTOM_EXTENSION_CATEGORY)
    )
  })

  // Compute the set of all extension IDs that are in at least one pack
  const packedExtensionIds = createMemo(() => {
    const ids = new Set<string>()
    for (const pack of extensionPacks()) {
      for (const extId of pack.extensionPack) {
        ids.add(extId)
      }
    }
    return ids
  })

  // Filter extensions not in any pack
  const unpackedExtensions = createMemo(() => {
    const packed = packedExtensionIds()
    return filteredExtensions().filter((ext) => !packed.has(ext.id))
  })

  const displayedExtensions = createMemo(() => {
    return activeTab() === 'unpacked' ? unpackedExtensions() : filteredExtensions()
  })

  const tabTitle = createMemo(() => {
    return activeTab() === 'unpacked' ? 'Unpacked Extensions' : 'VS Code Extensions'
  })

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      {/* Tabs */}
      <div class="border-b border-zinc-800 px-6 pt-4">
        <div class="flex gap-1">
          <button
            onClick={() => setActiveTab('all')}
            class={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors outline-none focus:outline-none ${
              activeTab() === 'all'
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 border-b-zinc-900 -mb-px'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
            }`}
          >
            All
            <Show when={filteredExtensions().length > 0}>
              <span class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-300">
                {filteredExtensions().length}
              </span>
            </Show>
          </button>
          <button
            onClick={() => setActiveTab('unpacked')}
            class={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors outline-none focus:outline-none ${
              activeTab() === 'unpacked'
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 border-b-zinc-900 -mb-px'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
            }`}
          >
            Unpacked
            <Show when={unpackedExtensions().length > 0}>
              <span class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-yellow-900 text-yellow-300">
                {unpackedExtensions().length}
              </span>
            </Show>
          </button>
        </div>
      </div>

      <main class="flex-1 flex flex-col overflow-hidden p-6">
        <Show when={filteredExtensions().length > 0 || error()}>
          <div class="flex-1 flex flex-col min-h-0">
            <Show
              when={!error()}
              fallback={
                <div class="bg-red-900/30 border border-red-800 rounded-lg p-4">
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
                      <h3 class="text-red-300 font-medium">Error loading extensions</h3>
                      <p class="text-red-400 text-sm mt-1">{error()}</p>
                    </div>
                  </div>
                </div>
              }
            >
              <ExtensionList
                extensions={displayedExtensions()}
                title={tabTitle()}
                showCount={true}
                availablePacks={extensionPacks()}
                onAddToPack={handleAddExtensionToPack}
                onToggleIgnore={handleToggleIgnore}
                onLoad={handleGetExtensions}
                loading={extensionLoading()}
              />
            </Show>
          </div>
        </Show>
      </main>
    </div>
  )
}

export default Extensions
