import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'

export interface ExtensionInfo {
  id: string
  name: string
  icon?: string
  publisherDisplayName?: string
}

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
  icon?: string
}

interface PackCardProps {
  pack: ExtensionPack
  onIconUploaded?: () => void
  extensionsMap?: Record<string, ExtensionInfo>
  onEdit?: (pack: ExtensionPack) => void
  onDelete?: (packName: string) => void
  onInstall?: (packName: string) => Promise<{ success: boolean; msg?: string }>
  onUninstall?: (packName: string) => Promise<{ success: boolean; msg?: string }>
}

const PackCard: Component<PackCardProps> = (props) => {
  const [building, setBuilding] = createSignal(false)
  const [uploadingIcon, setUploadingIcon] = createSignal(false)
  const [extensionsExpanded, setExtensionsExpanded] = createSignal(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false)
  const [installing, setInstalling] = createSignal(false)
  const [uninstalling, setUninstalling] = createSignal(false)

  const handleBuildPack = async (packName: string): Promise<void> => {
    setBuilding(true)
    try {
      const result = await window.api.buildExtensionPack(packName)
      if (result.success && result.data?.outputPath) {
        alert(`Extension pack built successfully!\nOutput file: ${result.data.outputPath}`)
      } else {
        alert(`Failed to build extension pack: ${result.msg || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to build extension pack:', error)
      alert(`Failed to build extension pack: ${error}`)
    } finally {
      setBuilding(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    props.onDelete?.(props.pack.name)
  }

  const handleEdit = () => {
    props.onEdit?.(props.pack)
  }

  const handleInstall = async (): Promise<void> => {
    setInstalling(true)
    try {
      const result = await props.onInstall?.(props.pack.name)
      if (result?.success) {
        alert(
          `Extension pack "${props.pack.displayName}" installed successfully!\nRestart VS Code to activate.`
        )
      } else {
        alert(`Failed to install: ${result?.msg || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to install extension pack:', error)
      alert(`Failed to install: ${error}`)
    } finally {
      setInstalling(false)
    }
  }

  const handleUninstall = async (): Promise<void> => {
    setUninstalling(true)
    try {
      const result = await props.onUninstall?.(props.pack.name)
      if (result?.success) {
        alert(
          `Extension pack "${props.pack.displayName}" uninstalled successfully!\nRestart VS Code to take effect.`
        )
      } else {
        alert(`Failed to uninstall: ${result?.msg || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to uninstall extension pack:', error)
      alert(`Failed to uninstall: ${error}`)
    } finally {
      setUninstalling(false)
    }
  }

  const handleUploadIcon = async (): Promise<void> => {
    setUploadingIcon(true)
    try {
      const result = await window.api.uploadPackIcon(props.pack.name)
      if (result.success) {
        props.onIconUploaded?.()
      }
    } catch (error) {
      console.error('Failed to upload icon:', error)
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleRemoveIcon = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()
    const result = await window.api.removePackIcon(props.pack.name)
    if (result.success) {
      props.onIconUploaded?.()
    }
  }

  return (
    <div class="group/card bg-zinc-900 rounded-lg border border-zinc-800 p-6 hover:shadow-lg hover:shadow-black/20 transition-shadow flex flex-col">
      <div class="flex justify-between items-start mb-4">
        {/* Icon */}
        <div class="flex-shrink-0 mr-4">
          <button
            onClick={handleUploadIcon}
            disabled={uploadingIcon()}
            class={`group relative w-16 h-16 rounded-lg overflow-hidden transition-colors cursor-pointer disabled:cursor-wait ${props.pack.icon ? 'border-0' : 'border border-zinc-700 hover:border-blue-500'}`}
            title="Click to upload pack icon"
          >
            <Show
              when={props.pack.icon}
              fallback={
                <div class="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              }
            >
              <img
                src={props.pack.icon}
                alt={props.pack.displayName}
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <button
                onClick={handleRemoveIcon}
                class="absolute top-0.5 right-0.5 w-5 h-5 bg-zinc-700 hover:bg-zinc-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                title="Remove icon"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Show>
            <Show when={uploadingIcon()}>
              <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                <svg class="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </Show>
          </button>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-semibold text-zinc-100 truncate mb-1">
            {props.pack.displayName}
          </h3>
          <p class="text-sm text-zinc-400 mb-2">v{props.pack.version}</p>
          {props.pack.description && (
            <p class="text-zinc-400 text-sm mb-3 line-clamp-2">{props.pack.description}</p>
          )}
        </div>

        <div class="flex gap-1 ml-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            onClick={handleInstall}
            disabled={installing()}
            class="group/tooltip relative p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-900/50 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Show
              when={!installing()}
              fallback={
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              }
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </Show>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-950 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              Install to VS Code
            </span>
          </button>
          <button
            onClick={handleUninstall}
            disabled={uninstalling()}
            class="group/tooltip relative p-2 text-zinc-500 hover:text-orange-400 hover:bg-orange-900/50 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Show
              when={!uninstalling()}
              fallback={
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              }
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </Show>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-950 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              Uninstall from VS Code
            </span>
          </button>
          <button
            onClick={() => handleEdit()}
            class="group/tooltip relative p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-900/50 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-950 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              Edit pack
            </span>
          </button>
          <button
            onClick={() => handleDelete()}
            class="group/tooltip relative p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-950 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
              Delete pack
            </span>
          </button>
        </div>
      </div>

      {/* Extension Preview */}
      <Show when={props.pack.extensionPack.length > 0}>
        <div class="border-t border-zinc-800 pt-4">
          <button
            onClick={() => setExtensionsExpanded((v) => !v)}
            class="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors w-full text-left cursor-pointer"
          >
            <svg
              class={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${extensionsExpanded() ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            Extensions included ({props.pack.extensionPack.length})
          </button>
          <Show when={extensionsExpanded()}>
            <div class="mt-2 pl-5 max-h-60 overflow-y-auto">
              <div class="space-y-2">
                <For each={props.pack.extensionPack}>
                  {(extId) => {
                    const info = () => props.extensionsMap?.[extId]
                    return (
                      <div class="flex items-center gap-2.5 text-sm" title={extId}>
                        <Show
                          when={info()?.icon}
                          fallback={
                            <div class="w-6 h-6 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center text-zinc-500 text-[9px] font-bold">
                              {(info()?.name || extId).charAt(0).toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            src={info()!.icon}
                            alt=""
                            class="w-6 h-6 rounded flex-shrink-0 object-cover"
                          />
                        </Show>
                        <span class="text-zinc-300 truncate">{info()?.name || extId}</span>
                      </div>
                    )
                  }}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      {/* Pack ID & Build */}
      <div class="mt-auto pt-4 border-t border-zinc-800">
        <p class="text-xs text-zinc-500 truncate mb-3" title={props.pack.name}>
          ID: {props.pack.name}
        </p>

        {/* Action Buttons */}
        <div class="flex gap-2">
          <button
            onClick={() => handleBuildPack(props.pack.name)}
            disabled={building()}
            class="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            title="Build this pack as .vsix file"
          >
            <Show when={building()}>
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </Show>
            {building() ? 'Building...' : 'Build Pack'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Show when={showDeleteConfirm()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false)
          }}
        >
          <div class="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 class="text-lg font-semibold text-zinc-100 mb-2">Delete Extension Pack</h3>
            <p class="text-sm text-zinc-400 mb-1">Are you sure you want to delete</p>
            <p class="text-sm text-zinc-200 font-medium mb-4">{props.pack.displayName}?</p>
            <p class="text-xs text-red-400 mb-6">
              This action cannot be undone. The pack folder will be permanently removed.
            </p>
            <div class="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                class="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default PackCard
