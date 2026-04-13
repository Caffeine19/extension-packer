import type { Component } from 'solid-js'
import { createSignal, Show } from 'solid-js'
import { toast } from 'solid-sonner'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Separator } from './ui/Separator'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/Tooltip'
import DeletePackDialog from './DeletePackDialog'
import UninstallPackDialog from './UninstallPackDialog'
import ExtensionAvatarStack from './ExtensionAvatarStack'

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
    <Card class="group/card flex flex-col p-6 transition-shadow hover:shadow-lg">
      <div class="mb-4 flex items-start justify-between">
        {/* Icon */}
        <div class="mr-4 flex-shrink-0">
          <button
            onClick={handleUploadIcon}
            disabled={uploadingIcon()}
            class={`group relative h-16 w-16 cursor-pointer overflow-hidden rounded-lg transition-colors disabled:cursor-wait ${props.pack.icon ? 'border-0' : 'border-border hover:border-primary border'}`}
            title="Click to upload pack icon"
          >
            <Show
              when={props.pack.icon}
              fallback={
                <div class="bg-muted text-muted-foreground group-hover:text-primary flex h-full w-full items-center justify-center transition-colors">
                  <i class="ph ph-image text-2xl" />
                </div>
              }
            >
              <img
                src={props.pack.icon}
                alt={props.pack.displayName}
                class="h-full w-full rounded-full object-cover"
              />
              <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <i class="ph ph-image text-xl text-white" />
              </div>
              <button
                onClick={handleRemoveIcon}
                class="bg-muted hover:bg-accent absolute top-0.5 right-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                title="Remove icon"
              >
                <i class="ph-bold ph-x text-foreground text-xs" />
              </button>
            </Show>
            <Show when={uploadingIcon()}>
              <div class="absolute inset-0 flex items-center justify-center bg-black/60">
                <Spinner />
              </div>
            </Show>
          </button>
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="truncate text-lg font-semibold">{props.pack.displayName}</h3>
          <p class="text-muted-foreground truncate text-xs" title={props.pack.name}>
            {props.pack.name}
          </p>
          <p class="text-muted-foreground mb-1 text-xs">v{props.pack.version}</p>

          {props.pack.description && (
            <p class="text-muted-foreground mb-3 line-clamp-2 text-sm">{props.pack.description}</p>
          )}
        </div>

        <div class="ml-4 flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
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

      {/* Extension Preview - Avatar Stack */}
      <Show when={props.pack.extensionPack.length > 0}>
        <Separator class="my-4" />
        <ExtensionAvatarStack
          extensionIds={props.pack.extensionPack}
          extensionsMap={props.extensionsMap}
        />
      </Show>

      {/* Pack ID & Build */}
      <Separator class="my-4" />

      <div>
        <div class="flex gap-2">
          <Button
            onClick={() => handleBuildPack(props.pack.name)}
            disabled={building()}
            class="flex-1"
            size="sm"
          >
            <Show
              when={building()}
              fallback={<i class="ph ph-hammer" style={{ 'font-size': '16px' }} />}
            >
              <Spinner />
            </Show>
            {building() ? 'Building...' : 'Build Pack'}
          </Button>
        </div>
      </div>

      <DeletePackDialog
        open={showDeleteConfirm()}
        onOpenChange={setShowDeleteConfirm}
        displayName={props.pack.displayName}
        onConfirm={handleConfirmDelete}
      />

      <UninstallPackDialog
        open={showUninstallConfirm()}
        onOpenChange={setShowUninstallConfirm}
        displayName={props.pack.displayName}
        onConfirm={handleConfirmUninstall}
      />
    </Card>
  )
}

export default PackCard
