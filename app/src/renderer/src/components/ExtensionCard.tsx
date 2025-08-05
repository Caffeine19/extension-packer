import type { Component } from 'solid-js'

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

interface ExtensionCardProps {
  extension: ExtensionData
}

const ExtensionCard: Component<ExtensionCardProps> = (props) => {
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleDateString()
  }

  const getPublisherName = (): string => {
    return (
      props.extension.publisherDisplayName || props.extension.publisherId || 'Unknown Publisher'
    )
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
      </div>
    </div>
  )
}

export default ExtensionCard
