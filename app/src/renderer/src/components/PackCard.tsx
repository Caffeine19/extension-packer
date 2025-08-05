import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'

interface ExtensionPack {
  name: string
  displayName: string
  description?: string
  version: string
  extensionPack: string[]
  categories?: string[]
  engines?: {
    vscode: string
  }
  folderPath: string
}

interface PackCardProps {
  pack: ExtensionPack
  onEdit?: (pack: ExtensionPack) => void
  onDelete?: (pack: ExtensionPack) => void
  onBuild?: (packName: string) => void
}

const PackCard: Component<PackCardProps> = (props) => {
  const formatExtensionCount = (): string => {
    const count = props.pack.extensionPack.length
    return `${count} extension${count !== 1 ? 's' : ''}`
  }

  const getCategoryBadgeColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'extension packs':
        return 'bg-blue-100 text-blue-800'
      case 'themes':
        return 'bg-purple-100 text-purple-800'
      case 'languages':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-semibold text-gray-900 truncate mb-1">
            {props.pack.displayName}
          </h3>
          <p class="text-sm text-gray-500 mb-2">v{props.pack.version}</p>
          {props.pack.description && (
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">{props.pack.description}</p>
          )}
        </div>

        <div class="flex gap-2 ml-4">
          {props.onEdit && (
            <button
              onClick={() => props.onEdit?.(props.pack)}
              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit pack"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {props.onDelete && (
            <button
              onClick={() => props.onDelete?.(props.pack)}
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete pack"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div class="flex items-center gap-4 mb-4">
        <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
          {formatExtensionCount()}
        </span>
        {props.pack.engines?.vscode && (
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            VS Code {props.pack.engines.vscode}
          </span>
        )}
      </div>

      {/* Categories */}
      <Show when={props.pack.categories && props.pack.categories.length > 0}>
        <div class="flex flex-wrap gap-2 mb-4">
          <For each={props.pack.categories}>
            {(category) => (
              <span
                class={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(category)}`}
              >
                {category}
              </span>
            )}
          </For>
        </div>
      </Show>

      {/* Extension Preview */}
      <Show when={props.pack.extensionPack.length > 0}>
        <div class="border-t pt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">Extensions included:</p>
          <div class="max-h-20 overflow-y-auto">
            <div class="text-xs text-gray-600 space-y-1">
              <For each={props.pack.extensionPack.slice(0, 5)}>
                {(ext) => (
                  <div class="truncate" title={ext}>
                    {ext}
                  </div>
                )}
              </For>
              <Show when={props.pack.extensionPack.length > 5}>
                <div class="text-gray-500 italic">
                  +{props.pack.extensionPack.length - 5} more...
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>

      {/* Pack ID */}
      <div class="mt-4 pt-4 border-t">
        <p class="text-xs text-gray-400 truncate mb-3" title={props.pack.name}>
          ID: {props.pack.name}
        </p>

        {/* Action Buttons */}
        <div class="flex gap-2">
          {props.onBuild && (
            <button
              onClick={() => props.onBuild?.(props.pack.name)}
              class="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              title="Build this pack as .vsix file"
            >
              Build Pack
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PackCard
