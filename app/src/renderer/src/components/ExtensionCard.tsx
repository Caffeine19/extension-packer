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
  isIgnored?: boolean
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
  onToggleIgnore?: (extensionId: string, isIgnored: boolean) => void
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

  const getPacksContainingExtension = (): ExtensionPack[] => {
    return props.availablePacks?.filter(pack =>
      pack.extensionPack.includes(props.extension.id)
    ) || []
  }

  const handleToggleIgnore = async (): Promise<void> => {
    const newIgnoredState = !props.extension.isIgnored
    props.onToggleIgnore?.(props.extension.id, newIgnoredState)
  }

  return (
    <div class={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
      props.extension.isIgnored ? 'opacity-60 bg-gray-50' : ''
    }`}>
      <div class="flex items-start gap-3">
        {/* Extension Icon */}
        <div class="flex-shrink-0">
          {props.extension.icon ? (
            <img
              src={props.extension.icon}
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
            {props.extension.isIgnored && (
              <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Ignored
              </span>
            )}
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

          {/* Pack Tags */}
          <Show when={getPacksContainingExtension().length > 0}>
            <div class="mt-2 flex flex-wrap gap-1">
              <span class="text-xs text-gray-500 mr-1">In packs:</span>
              <For each={getPacksContainingExtension()}>
                {(pack) => (
                  <span class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {pack.displayName}
                  </span>
                )}
              </For>
            </div>
          </Show>

          <p class="text-xs text-gray-400 mt-2 truncate" title={props.extension.id}>
            ID: {props.extension.id}
          </p>
        </div>

        {/* Action Buttons */}
        <div class="flex flex-col gap-2 flex-shrink-0">
          {/* Ignore Button */}
          <button
            onClick={handleToggleIgnore}
            class={`px-3 py-2 text-sm rounded transition-colors flex items-center gap-2 ${
              props.extension.isIgnored
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={props.extension.isIgnored ? 'Remove from ignored list' : 'Add to ignored list'}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {props.extension.isIgnored ? (
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              )}
            </svg>
            {props.extension.isIgnored ? 'Unignore' : 'Ignore'}
          </button>

          {/* Add to Pack Button */}
          <Show when={props.availablePacks && props.availablePacks.length > 0 && !props.extension.isIgnored}>
            <div class="relative">
              <button
                onClick={() => setShowPackMenu(!showPackMenu())}
                class="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center gap-2 w-full justify-center"
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

          {/* Ignored Extensions Message */}
          <Show when={props.extension.isIgnored}>
            <div class="text-xs text-yellow-600 text-center italic">
              Ignored extension
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default ExtensionCard
