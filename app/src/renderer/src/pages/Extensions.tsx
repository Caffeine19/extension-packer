import type { Component } from 'solid-js'
import { Show, createSignal, createMemo } from 'solid-js'
import { useExtensionStore } from '../stores/extension'
import { usePackStore } from '../stores/pack'
import { CUSTOM_EXTENSION_CATEGORY } from '@shared/pack'
import ExtensionList from '../components/ExtensionList'
import type { ExtensionData } from '../components/ExtensionCard'
import { Badge } from '../components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from '../components/ui/Tabs'

type ExtensionTab = 'all' | 'unpacked'

const Extensions: Component = () => {
  const { extensions, error, extensionLoading, handleGetExtensions, handleToggleIgnore } =
    useExtensionStore()

  const { extensionPacks, handleAddExtensionToPack } = usePackStore()

  const [activeTab, setActiveTab] = createSignal<ExtensionTab>('all')

  const filteredExtensions = createMemo(() => {
    return (extensions() as ExtensionData[]).filter(
      (ext) => !ext.categories?.includes(CUSTOM_EXTENSION_CATEGORY)
    )
  })

  const packedExtensionIds = createMemo(() => {
    const ids = new Set<string>()
    for (const pack of extensionPacks()) {
      for (const extId of pack.extensionPack) {
        ids.add(extId)
      }
    }
    return ids
  })

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
    <div class="flex-1 flex flex-col overflow-hidden bg-background p-6 pt-4">
      <Show when={filteredExtensions().length > 0 || error()}>
        <div class="flex-1 flex flex-col min-h-0">
          <Show
            when={!error()}
            fallback={
              <div class="bg-destructive/10 border border-destructive/50 rounded-lg p-4 mb-4">
                <div class="flex items-center">
                  <div class="text-destructive mr-3">
                    <i class="ph-bold ph-x-circle text-xl" />
                  </div>
                  <div>
                    <h3 class="text-destructive font-medium">Error loading extensions</h3>
                    <p class="text-destructive/80 text-sm mt-1">{error()}</p>
                  </div>
                </div>
              </div>
            }
          >
            <ExtensionList
              extensions={displayedExtensions()}
              headerExtra={
                <Tabs
                  value={activeTab()}
                  onChange={(val) => setActiveTab(val as ExtensionTab)}
                  class="w-max"
                >
                  <TabsList class="w-max">
                    <TabsTrigger value="all">
                      All
                      <Show when={filteredExtensions().length > 0}>
                        <Badge variant="secondary" round class="ml-2 text-xs font-normal">
                          {filteredExtensions().length}
                        </Badge>
                      </Show>
                    </TabsTrigger>
                    <TabsTrigger value="unpacked">
                      Unpacked
                      <Show when={unpackedExtensions().length > 0}>
                        <Badge variant="warning" round class="ml-2 text-xs font-normal">
                          {unpackedExtensions().length}
                        </Badge>
                      </Show>
                    </TabsTrigger>
                    <TabsIndicator />
                  </TabsList>
                </Tabs>
              }
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
    </div>
  )
}

export default Extensions
