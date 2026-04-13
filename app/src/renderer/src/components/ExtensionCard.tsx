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
              class="h-12 w-12 rounded-md object-contain object-center"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            class="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-md font-semibold"
            style={{ display: props.extension.icon ? 'none' : 'flex' }}
          >
            {props.extension.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Extension Details */}
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex items-center gap-2">
            <h3 class="truncate text-lg font-semibold">{props.extension.name}</h3>
            {props.extension.isIgnored && (
              <Badge variant="warning" round>
                Ignored
              </Badge>
            )}
            {props.extension.preRelease && (
              <Badge variant="default" round>
                Pre-release
              </Badge>
            )}
            {props.extension.preview && (
              <Badge variant="default" round>
                Preview
              </Badge>
            )}
            {props.extension.updated && (
              <Badge variant="success" round>
                Updated
              </Badge>
            )}
          </div>

          <p class="text-muted-foreground mb-2 text-sm">by {getPublisherName()}</p>

          <div class="text-muted-foreground flex items-center gap-4 text-sm">
            <span>v{props.extension.version}</span>
            <span>Installed: {formatDate(props.extension.installedTimestamp)}</span>
          </div>

          <p class="text-muted-foreground mt-2 truncate text-sm" title={props.extension.id}>
            ID: {props.extension.id}
          </p>
          {/* Pack Tags */}
          <Show when={getPacksContainingExtension().length > 0}>
            <div class="mt-2 flex flex-wrap items-center gap-1">
              <span class="text-muted-foreground mr-1 text-sm">In packs:</span>
              <For each={getPacksContainingExtension()}>
                {(pack) => (
                  <Badge variant="secondary" round class="text-[10px]">
                    {extractPackKeyword(pack.displayName)}
                  </Badge>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Action Buttons */}
        <div class="flex flex-shrink-0 gap-2 self-end">
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
                    <i class="ph ph-package" style={{ 'font-size': '16px' }} />
                    Moveto Pack
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
                      <div class="flex min-w-0 flex-1 items-center gap-2">
                        <Show
                          when={pack.icon}
                          fallback={
                            <div class="bg-muted text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold">
                              {pack.displayName.charAt(0).toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            src={pack.icon}
                            alt=""
                            class="h-6 w-6 flex-shrink-0 rounded object-cover"
                          />
                        </Show>
                        <div class="min-w-0">
                          <div class="truncate font-medium">
                            {extractPackKeyword(pack.displayName)}{' '}
                            <span class="text-muted-foreground text-xs font-normal">
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
                    <i class="ph ph-eye" style={{ 'font-size': '16px' }} />
                  ) : (
                    <i class="ph ph-eye-slash" style={{ 'font-size': '16px' }} />
                  )}
                  {props.extension.isIgnored ? 'Unignore' : 'Ignore'}
                </Button>
              )}
            />
            <TooltipContent>
              {props.extension.isIgnored ? 'Remove from ignored list' : 'Add to ignored list'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Card>
  )
}

export default ExtensionCard
