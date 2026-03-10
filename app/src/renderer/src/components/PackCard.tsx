import type { Component } from 'solid-js'
import { createSignal, For, Show } from 'solid-js'
import { toast } from 'solid-sonner'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Separator } from './ui/Separator'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/Tooltip'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription
} from './ui/AlertDialog'

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
  const [showUninstallConfirm, setShowUninstallConfirm] = createSignal(false)
  const [installing, setInstalling] = createSignal(false)
  const [uninstalling, setUninstalling] = createSignal(false)

  const handleBuildPack = async (packName: string): Promise<void> => {
    setBuilding(true)
    try {
      const result = await window.api.buildExtensionPack(packName)
      if (result.success && result.data?.outputPath) {
        toast.success('Extension pack built successfully!', {
          description: `Output: ${result.data.outputPath}`
        })
      } else {
        toast.error('Failed to build extension pack', {
          description: result.msg || 'Unknown error'
        })
      }
    } catch (error) {
      console.error('Failed to build extension pack:', error)
      toast.error('Failed to build extension pack', {
        description: String(error)
      })
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
        toast.success(`"${props.pack.displayName}" installed`, {
          description: 'Restart VS Code to activate.'
        })
      } else {
        toast.error('Failed to install', {
          description: result?.msg || 'Unknown error'
        })
      }
    } catch (error) {
      console.error('Failed to install extension pack:', error)
      toast.error('Failed to install', { description: String(error) })
    } finally {
      setInstalling(false)
    }
  }

  const handleUninstall = () => {
    setShowUninstallConfirm(true)
  }

  const handleConfirmUninstall = async (): Promise<void> => {
    setShowUninstallConfirm(false)
    setUninstalling(true)
    try {
      const result = await props.onUninstall?.(props.pack.name)
      if (result?.success) {
        toast.success(`"${props.pack.displayName}" uninstalled`, {
          description: 'Restart VS Code to take effect.'
        })
      } else {
        toast.error('Failed to uninstall', {
          description: result?.msg || 'Unknown error'
        })
      }
    } catch (error) {
      console.error('Failed to uninstall extension pack:', error)
      toast.error('Failed to uninstall', { description: String(error) })
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

  const Spinner = () => <i class="ph ph-spinner animate-spin" />

  return (
    <Card class="group/card p-6 hover:shadow-lg transition-shadow flex flex-col">
      <div class="flex justify-between items-start mb-4">
        {/* Icon */}
        <div class="flex-shrink-0 mr-4">
          <button
            onClick={handleUploadIcon}
            disabled={uploadingIcon()}
            class={`group relative w-16 h-16 rounded-lg overflow-hidden transition-colors cursor-pointer disabled:cursor-wait ${props.pack.icon ? 'border-0' : 'border border-border hover:border-primary'}`}
            title="Click to upload pack icon"
          >
            <Show
              when={props.pack.icon}
              fallback={
                <div class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <i class="ph ph-image text-2xl" />
                </div>
              }
            >
              <img
                src={props.pack.icon}
                alt={props.pack.displayName}
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <i class="ph ph-image text-xl text-white" />
              </div>
              <button
                onClick={handleRemoveIcon}
                class="absolute top-0.5 right-0.5 w-5 h-5 bg-muted hover:bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                title="Remove icon"
              >
                <i class="ph-bold ph-x text-xs text-foreground" />
              </button>
            </Show>
            <Show when={uploadingIcon()}>
              <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Spinner />
              </div>
            </Show>
          </button>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-semibold truncate mb-1">{props.pack.displayName}</h3>
          <p class="text-sm text-muted-foreground mb-2">v{props.pack.version}</p>
          {props.pack.description && (
            <p class="text-muted-foreground text-sm mb-3 line-clamp-2">{props.pack.description}</p>
          )}
        </div>

        <div class="flex gap-1 ml-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger
              as={(p: Record<string, unknown>) => (
                <Button
                  {...p}
                  variant="ghost"
                  size="icon"
                  onClick={handleInstall}
                  disabled={installing()}
                >
                  <Show when={!installing()} fallback={<Spinner />}>
                    <i class="ph ph-download-simple" />
                  </Show>
                </Button>
              )}
            />
            <TooltipContent>Install to VS Code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              as={(p: Record<string, unknown>) => (
                <Button
                  {...p}
                  variant="ghost"
                  size="icon"
                  onClick={handleUninstall}
                  disabled={uninstalling()}
                >
                  <Show when={!uninstalling()} fallback={<Spinner />}>
                    <i class="ph ph-upload-simple" />
                  </Show>
                </Button>
              )}
            />
            <TooltipContent>Uninstall from VS Code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              as={(p: Record<string, unknown>) => (
                <Button {...p} variant="ghost" size="icon" onClick={handleEdit}>
                  <i class="ph ph-pencil-simple" />
                </Button>
              )}
            />
            <TooltipContent>Edit pack</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              as={(p: Record<string, unknown>) => (
                <Button {...p} variant="ghost" size="icon" onClick={handleDelete}>
                  <i class="ph ph-trash" />
                </Button>
              )}
            />
            <TooltipContent>Delete pack</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Extension Preview */}
      <Show when={props.pack.extensionPack.length > 0}>
        <Separator class="my-4" />
        <div>
          <button
            onClick={() => setExtensionsExpanded((v) => !v)}
            class="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left cursor-pointer"
          >
            <i
              class={`ph ph-caret-right text-sm transition-transform flex-shrink-0 ${extensionsExpanded() ? 'rotate-90' : ''}`}
            />
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
                            <div class="w-6 h-6 bg-muted rounded flex-shrink-0 flex items-center justify-center text-muted-foreground text-[9px] font-bold">
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
                        <span class="text-foreground/80 truncate">{info()?.name || extId}</span>
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
      <Separator class="mt-auto mb-4" />
      <div>
        <p class="text-xs text-muted-foreground truncate mb-3" title={props.pack.name}>
          ID: {props.pack.name}
        </p>

        <div class="flex gap-2">
          <Button
            onClick={() => handleBuildPack(props.pack.name)}
            disabled={building()}
            class="flex-1"
            size="sm"
          >
            <Show when={building()}>
              <Spinner />
            </Show>
            {building() ? 'Building...' : 'Build Pack'}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm()} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Extension Pack</AlertDialogTitle>
          <AlertDialogDescription>
            <p class="mb-1">Are you sure you want to delete</p>
            <p class="font-medium text-foreground mb-4">{props.pack.displayName}?</p>
            <p class="text-destructive text-xs">
              This action cannot be undone. The pack folder will be permanently removed.
            </p>
          </AlertDialogDescription>
          <div class="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Uninstall Confirmation Dialog */}
      <AlertDialog open={showUninstallConfirm()} onOpenChange={setShowUninstallConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Uninstall Extension Pack</AlertDialogTitle>
          <AlertDialogDescription>
            <p class="mb-1">Are you sure you want to uninstall</p>
            <p class="font-medium text-foreground mb-4">{props.pack.displayName}?</p>
            <p class="text-muted-foreground text-xs">
              You will need to restart VS Code for the change to take effect.
            </p>
          </AlertDialogDescription>
          <div class="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowUninstallConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmUninstall}>
              Uninstall
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default PackCard
