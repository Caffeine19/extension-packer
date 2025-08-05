import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import ExtensionCard, { type ExtensionData, type ExtensionPack } from './ExtensionCard'

interface ExtensionListProps {
  extensions: ExtensionData[]
  title?: string
  showCount?: boolean
  availablePacks?: ExtensionPack[]
  onAddToPack?: (extensionId: string, packName: string) => void
}

const ExtensionList: Component<ExtensionListProps> = (props) => {
  return (
    <div class="space-y-4">
      <Show when={props.title}>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">{props.title}</h2>
          <Show when={props.showCount}>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {props.extensions.length} extensions
            </span>
          </Show>
        </div>
      </Show>

      <Show
        when={props.extensions.length > 0}
        fallback={
          <div class="text-center py-12 text-gray-500">
            <div class="text-4xl mb-4">📦</div>
            <p class="text-lg font-medium">No extensions found</p>
            <p class="text-sm">Try checking a different VS Code installation.</p>
          </div>
        }
      >
        <div class="grid gap-4">
          <For each={props.extensions}>
            {(extension) => (
              <ExtensionCard
                extension={extension}
                availablePacks={props.availablePacks}
                onAddToPack={props.onAddToPack}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default ExtensionList
