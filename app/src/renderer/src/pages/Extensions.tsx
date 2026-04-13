import type { Component } from 'solid-js'
import { Show, createMemo } from 'solid-js'
import { useExtensionStore } from '../stores/extension'
import { usePackStore } from '../stores/pack'
import { CUSTOM_EXTENSION_CATEGORY } from '@shared/pack'
import ExtensionList from '../components/ExtensionList'
import type { ExtensionData } from '../components/ExtensionCard'

const Extensions: Component = () => {
  const { extensions, error, extensionLoading, handleGetExtensions, handleToggleIgnore } =
    useExtensionStore()

  const { extensionPacks, handleAddExtensionToPack } = usePackStore()

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

  return (
    <div class="bg-background flex flex-1 flex-col overflow-hidden p-6 pt-4">
      <Show when={filteredExtensions().length > 0 || error()}>
        <div class="flex min-h-0 flex-1 flex-col">
          <Show
            when={!error()}
            fallback={
              <div class="bg-destructive/10 border-destructive/50 mb-4 rounded-lg border p-4">
                <div class="flex items-center">
                  <div class="text-destructive mr-3">
                    <i class="ph-bold ph-x-circle text-xl" />
                  </div>
                  <div>
                    <h3 class="text-destructive font-medium">Error loading extensions</h3>
                    <p class="text-destructive/80 mt-1 text-sm">{error()}</p>
                  </div>
                </div>
              </div>
            }
          >
            <ExtensionList
              extensions={filteredExtensions()}
              unpackedExtensions={unpackedExtensions()}
              title="VS Code Extensions"
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
