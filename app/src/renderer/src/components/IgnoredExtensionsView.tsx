import type { Component } from 'solid-js'
import { createSignal, Show, For, createMemo } from 'solid-js'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Separator } from './ui/Separator'
import { TextField, TextFieldInput } from './ui/TextField'
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

interface IgnoredExtensionsViewProps {
  ignoredExtensions: string[]
  onRemoveFromIgnored: (extensionId: string) => void
  onClearAll: () => void
  extensionsMap?: Record<string, ExtensionInfo>
}

const IgnoredExtensionsView: Component<IgnoredExtensionsViewProps> = (props) => {
  const [showConfirmClear, setShowConfirmClear] = createSignal(false)
  const [searchQuery, setSearchQuery] = createSignal('')

  const debouncedSetSearchQuery = createDebouncedSetter(setSearchQuery, 300)

  const filteredIgnoredExtensions = createMemo(() => {
    const query = searchQuery().trim()
    if (!query) {
      return props.ignoredExtensions
    }

    return props.ignoredExtensions.filter((extensionId) =>
      searchMultipleFields(query, [extensionId])
    )
  })

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleSearchInput = (value: string) => {
    debouncedSetSearchQuery(value)
  }

  const handleClearAll = (): void => {
    if (props.ignoredExtensions.length === 0) return
    setShowConfirmClear(true)
  }

  const confirmClearAll = (): void => {
    props.onClearAll()
    setShowConfirmClear(false)
  }

  return (
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 flex-col gap-4">
        <div class="flex min-h-[40px] items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold tracking-tight">Ignored Extensions</h2>
            <p class="text-muted-foreground mt-1 text-sm">
              Extensions that will not be available for adding to extension packs
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="default" round>
              {filteredIgnoredExtensions().length}
            </Badge>
            <Show when={searchQuery()}>
              <Badge variant="default" round>
                {filteredIgnoredExtensions().length} of {props.ignoredExtensions.length} Found
              </Badge>
            </Show>
          </div>
        </div>

        {/* Search Bar */}
        <Show when={props.ignoredExtensions.length > 0}>
          <div class="flex items-center gap-3 pb-2">
            <TextField class="flex-1">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <i class="ph ph-magnifying-glass text-muted-foreground text-xl" />
                </div>
                <TextFieldInput
                  type="text"
                  placeholder="Search ignored extensions by ID..."
                  value={searchQuery()}
                  onInput={(e) => handleSearchInput(e.currentTarget.value)}
                  class="pr-10 pl-10"
                />
                <Show when={searchQuery()}>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      onClick={clearSearch}
                      class="text-muted-foreground hover:text-foreground focus:outline-none"
                      title="Clear search"
                    >
                      <i class="ph ph-x text-xl" />
                    </button>
                  </div>
                </Show>
              </div>
            </TextField>
            <Button variant="secondary" size="sm" onClick={handleClearAll}>
              <i class="ph ph-trash" style={{ 'font-size': '16px' }} />
              Clear All
            </Button>
          </div>
        </Show>
      </div>

      <div class="mt-6 min-h-0 flex-1 overflow-auto">
        <Show
          when={filteredIgnoredExtensions().length > 0}
          fallback={
            <div class="py-12 text-center">
              <div class="text-muted-foreground mb-4">
                <i class="ph ph-eye-slash mx-auto block text-7xl" />
              </div>
              <Show
                when={searchQuery()}
                fallback={
                  <div>
                    <h3 class="mb-2 text-lg font-medium">No ignored extensions</h3>
                    <p class="text-muted-foreground">
                      Extensions marked as ignored will appear here and won't be available for
                      adding to packs
                    </p>
                  </div>
                }
              >
                <div>
                  <h3 class="mb-2 text-lg font-medium">No extensions match your search</h3>
                  <p class="text-muted-foreground mb-4">
                    Try adjusting your search terms or clearing the search.
                  </p>
                  <Button onClick={clearSearch} size="sm">
                    <i class="ph ph-x" style={{ 'font-size': '16px' }} />
                    Clear Search
                  </Button>
                </div>
              </Show>
            </div>
          }
        >
          <Card>
            <div class="px-4 py-3">
              <h3 class="text-muted-foreground text-sm font-medium">Ignored Extension IDs</h3>
            </div>
            <Separator />
            <div class="divide-border divide-y">
              <For each={filteredIgnoredExtensions()}>
                {(extensionId) => {
                  const info = () => props.extensionsMap?.[extensionId]
                  return (
                    <div class="hover:bg-muted/50 flex items-center justify-between px-4 py-3">
                      <div class="flex min-w-0 flex-1 items-center gap-3">
                        <Show
                          when={info()?.icon}
                          fallback={
                            <div class="bg-muted text-muted-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-xs font-bold">
                              {(info()?.name || extensionId).charAt(0).toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            src={info()!.icon}
                            alt=""
                            class="h-8 w-8 flex-shrink-0 rounded object-cover"
                          />
                        </Show>
                        <div class="min-w-0">
                          <p class="truncate text-sm font-medium">{info()?.name || extensionId}</p>
                          <p class="text-muted-foreground truncate font-mono text-xs">
                            {extensionId}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => props.onRemoveFromIgnored(extensionId)}
                        class="ml-4 flex-shrink-0"
                      >
                        <i class="ph ph-minus-circle" style={{ 'font-size': '16px' }} />
                        Remove
                      </Button>
                    </div>
                  )
                }}
              </For>
            </div>
          </Card>
        </Show>
      </div>

      {/* Confirm Clear All Dialog */}
      <AlertDialog open={showConfirmClear()} onOpenChange={setShowConfirmClear}>
        <AlertDialogContent>
          <AlertDialogTitle>Clear All Ignored Extensions?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all {props.ignoredExtensions.length} extensions from the ignored list.
            They will become available for adding to extension packs again.
          </AlertDialogDescription>
          <div class="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={confirmClearAll}>
              Clear All
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default IgnoredExtensionsView
