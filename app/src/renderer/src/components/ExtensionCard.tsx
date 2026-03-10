import type { Component } from 'solid-js'
import { Show, For } from 'solid-js'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './ui/DropdownMenu'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/Tooltip'
import { cn } from '@renderer/lib/utils'

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
  categories?: string[]
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
  icon?: string
}

interface ExtensionCardProps {
  extension: ExtensionData
  availablePacks?: ExtensionPack[]
  onAddToPack?: (extensionId: string, packName: string) => void
  onToggleIgnore?: (extensionId: string, isIgnored: boolean) => void
}

const ExtensionCard: Component<ExtensionCardProps> = (props) => {
  const extractPackKeyword = (displayName: string): string => {
    const match = displayName.match(/\((.+)\)\s*$/)
    return match ? match[1] : displayName
  }

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
  }

  const isExtensionInPack = (pack: ExtensionPack): boolean => {
    return pack.extensionPack.includes(props.extension.id)
  }

  const getPacksContainingExtension = (): ExtensionPack[] => {
    return (
      props.availablePacks?.filter((pack) => pack.extensionPack.includes(props.extension.id)) || []
    )
  }

  const handleToggleIgnore = async (): Promise<void> => {
    const newIgnoredState = !props.extension.isIgnored
    props.onToggleIgnore?.(props.extension.id, newIgnoredState)
  }

  return (
    <Card class={cn('p-4 transition-colors', props.extension.isIgnored && 'opacity-60')}>
      <div class="flex items-start gap-3">
        {/* Extension Icon */}
        <div class="flex-shrink-0">
          {props.extension.icon ? (
            <img
              src={props.extension.icon}
              alt={props.extension.name}
              class="w-12 h-12 rounded-md object-center object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            class="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary font-semibold"
            style={{ display: props.extension.icon ? 'none' : 'flex' }}
          >
            {props.extension.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Extension Details */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-semibold truncate">{props.extension.name}</h3>
            {props.extension.isIgnored && (
              <Badge variant="warning" round>
                Ignored
              </Badge>
            )}
            {props.extension.preRelease && (
              <Badge variant="warning" round>
                Pre-release
              </Badge>
            )}
            {props.extension.preview && (
              <Badge variant="warning" round>
                Preview
              </Badge>
            )}
            {props.extension.updated && (
              <Badge variant="success" round>
                Updated
              </Badge>
            )}
          </div>

          <p class="text-sm text-muted-foreground mb-2">by {getPublisherName()}</p>

          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span>v{props.extension.version}</span>
            <span>Installed: {formatDate(props.extension.installedTimestamp)}</span>
          </div>

          {/* Pack Tags */}
          <Show when={getPacksContainingExtension().length > 0}>
            <div class="mt-2 flex flex-wrap items-center gap-1">
              <span class="text-xs text-muted-foreground mr-1">In packs:</span>
              <For each={getPacksContainingExtension()}>
                {(pack) => (
                  <Badge variant="secondary" round class="text-[10px]">
                    {extractPackKeyword(pack.displayName)}
                  </Badge>
                )}
              </For>
            </div>
          </Show>

          <p class="text-xs text-muted-foreground mt-2 truncate" title={props.extension.id}>
            ID: {props.extension.id}
          </p>
        </div>

        {/* Action Buttons */}
        <div class="flex flex-col gap-2 flex-shrink-0">
          {/* Ignore Button */}
          <Tooltip>
            <TooltipTrigger
              as={(p: Record<string, unknown>) => (
                <Button
                  {...p}
                  variant={props.extension.isIgnored ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleIgnore}
                >
                  {props.extension.isIgnored ? (
                    <i class="ph ph-eye" />
                  ) : (
                    <i class="ph ph-eye-slash" />
                  )}
                  {props.extension.isIgnored ? 'Unignore' : 'Ignore'}
                </Button>
              )}
            />
            <TooltipContent>
              {props.extension.isIgnored ? 'Remove from ignored list' : 'Add to ignored list'}
            </TooltipContent>
          </Tooltip>

          {/* Add to Pack Dropdown */}
          <Show
            when={
              props.availablePacks && props.availablePacks.length > 0 && !props.extension.isIgnored
            }
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                as={(p: Record<string, unknown>) => (
                  <Button {...p} size="sm" class="w-full">
                    <i class="ph ph-plus" />
                    Add to Pack
                  </Button>
                )}
              />
              <DropdownMenuContent class="w-64">
                <DropdownMenuLabel>Select Extension Pack</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <For each={props.availablePacks}>
                  {(pack) => (
                    <DropdownMenuItem
                      onSelect={() => handleAddToPack(pack.name)}
                      disabled={isExtensionInPack(pack)}
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <Show
                          when={pack.icon}
                          fallback={
                            <div class="w-6 h-6 bg-muted rounded flex-shrink-0 flex items-center justify-center text-muted-foreground text-[9px] font-bold">
                              {pack.displayName.charAt(0).toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            src={pack.icon}
                            alt=""
                            class="w-6 h-6 rounded flex-shrink-0 object-cover"
                          />
                        </Show>
                        <div class="min-w-0">
                          <div class="truncate font-medium">
                            {extractPackKeyword(pack.displayName)}{' '}
                            <span class="text-xs text-muted-foreground font-normal">
                              ({pack.extensionPack.length})
                            </span>
                          </div>
                        </div>
                      </div>
                      <Show when={isExtensionInPack(pack)}>
                        <i class="ph-bold ph-check text-primary" />
                      </Show>
                    </DropdownMenuItem>
                  )}
                </For>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>

          <Show when={props.extension.isIgnored}>
            <div class="text-xs text-muted-foreground text-center italic">Ignored extension</div>
          </Show>
        </div>
      </div>
    </Card>
  )
}

export default ExtensionCard
