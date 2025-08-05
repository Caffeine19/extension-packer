import type { Component } from 'solid-js'
import { createSignal, Show, For } from 'solid-js'

export interface ExtensionData {
  id: string
  name: string
  version: string
  preRelease?: boolean
  icon?: string
  updated?: boolean
  fsPath: string
  publisherId?: string
  publisherDisplayName?: string
  preview?: boolean
  installedTimestamp?: number
}

export interface ExtensionPack {
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

interface ExtensionCardProps {
  extension: ExtensionData
  availablePacks?: ExtensionPack[]
  onAddToPack?: (extensionId: string, packName: string) => void
}

const ExtensionCard: Component<ExtensionCardProps> = (props) => {
  const [showPackMenu, setShowPackMenu] = createSignal(false)

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleDateString()
  }

  const getPublisherName = (): string => {
    return (
      props.extension.publisherDisplayName || props.extension.publisherId || 'Unknown Publisher'
    )
  }

  const handleAddToPack = (packName: string): void => {
    props.onAddToPack?.(packName, props.extension.id)
    setShowPackMenu(false)
  }

  const isExtensionInPack = (pack: ExtensionPack): boolean => {
    return pack.extensionPack.includes(props.extension.id)
  }

  return (
    <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div class="flex items-start gap-3">
        {/* Extension Icon */}
        <div class="flex-shrink-0">
          {props.extension.icon ? (
            <img
              src={`file://${props.extension.icon}`}
              alt={props.extension.name}
              class="w-12 h-12 rounded"
              onError={(e) => {
                // Fallback to a default icon if image fails to load
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            class="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-semibold"
            style={{ display: props.extension.icon ? 'none' : 'flex' }}
          >
            {props.extension.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Extension Details */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-semibold text-gray-900 truncate">{props.extension.name}</h3>
            {props.extension.preRelease && (
              <span class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Pre-release
              </span>
            )}
            {props.extension.preview && (
              <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Preview
              </span>
            )}
            {props.extension.updated && (
              <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Updated
              </span>
            )}
          </div>

          <p class="text-sm text-gray-600 mb-2">by {getPublisherName()}</p>

          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>v{props.extension.version}</span>
            <span>Installed: {formatDate(props.extension.installedTimestamp)}</span>
          </div>

          <p class="text-xs text-gray-400 mt-2 truncate" title={props.extension.id}>
            ID: {props.extension.id}
          </p>
        </div>

        {/* Add to Pack Button */}
        <Show when={props.availablePacks && props.availablePacks.length > 0}>
          <div class="relative flex-shrink-0">
            <button
              onClick={() => setShowPackMenu(!showPackMenu())}
              class="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
              title="Add to extension pack"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add to Pack
              <svg
                class={`w-4 h-4 transition-transform ${showPackMenu() ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Pack Selection Dropdown */}
            <Show when={showPackMenu()}>
              <div class="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div class="py-2">
                  <div class="px-3 py-2 text-sm font-medium text-gray-700 border-b">
                    Select Extension Pack
                  </div>
                  <For each={props.availablePacks}>
                    {(pack) => (
                      <button
                        onClick={() => handleAddToPack(pack.name)}
                        disabled={isExtensionInPack(pack)}
                        class={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                          isExtensionInPack(pack)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        title={
                          isExtensionInPack(pack)
                            ? 'Extension already in this pack'
                            : `Add to ${pack.displayName}`
                        }
                      >
                        <div class="flex-1 min-w-0">
                          <div class="truncate font-medium">{pack.displayName}</div>
                          <div class="text-xs text-gray-500 truncate">
                            {pack.extensionPack.length} extensions
                          </div>
                        </div>
                        <Show when={isExtensionInPack(pack)}>
                          <svg
                            class="w-4 h-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default ExtensionCard
