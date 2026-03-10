import type { Component, JSX } from 'solid-js'
import { For, Show, createSignal, createMemo } from 'solid-js'
import ExtensionCard, { type ExtensionData, type ExtensionPack } from './ExtensionCard'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Checkbox, CheckboxLabel } from './ui/Checkbox'
import { TextField, TextFieldInput } from './ui/TextField'

interface ExtensionListProps {
  extensions: ExtensionData[]
  title?: JSX.Element
  showCount?: boolean
  availablePacks?: ExtensionPack[]
  onAddToPack?: (extensionId: string, packName: string) => void
  onToggleIgnore?: (extensionId: string, isIgnored: boolean) => void
  onLoad?: () => void
  loading?: boolean
  headerExtra?: JSX.Element
}

const ExtensionList: Component<ExtensionListProps> = (props) => {
  const [showIgnored, setShowIgnored] = createSignal(localStorage.getItem('showIgnored') === 'true')
  const [searchQuery, setSearchQuery] = createSignal('')

  const updateShowIgnored = (value: boolean) => {
    setShowIgnored(value)
    localStorage.setItem('showIgnored', String(value))
  }

  const debouncedSetSearchQuery = createDebouncedSetter(setSearchQuery, 300)

  const filteredExtensions = createMemo(() => {
    let extensions = props.extensions

    if (!showIgnored()) {
      extensions = extensions.filter((ext) => !ext.isIgnored)
    }

    const query = searchQuery().trim()
    if (query) {
      extensions = extensions.filter((ext) => {
        const searchFields = [
          ext.name,
          ext.id,
          ext.publisherDisplayName || '',
          ext.publisherId || ''
        ]
        return searchMultipleFields(query, searchFields)
      })
    }

    return extensions
  })

  const ignoredCount = createMemo(() => props.extensions.filter((ext) => ext.isIgnored).length)

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleSearchInput = (value: string) => {
    debouncedSetSearchQuery(value)
  }

  return (
    <div class="flex flex-col h-full">
      <div class="shrink-0 flex flex-col gap-4">
        {/* Top row: Title and Header Actions */}
        <div class="flex items-center justify-between min-h-[40px]">
          <div class="flex items-center gap-4">
            <Show when={props.title}>
              <Show when={typeof props.title === 'string'} fallback={props.title}>
                <h2 class="text-2xl font-bold tracking-tight">{props.title}</h2>
              </Show>
            </Show>
            {props.headerExtra}
            <Show when={ignoredCount() > 0}>
              <Checkbox checked={showIgnored()} onChange={(checked) => updateShowIgnored(checked)}>
                <CheckboxLabel class="text-sm text-muted-foreground cursor-pointer whitespace-nowrap">
                  Show ignored ({ignoredCount()})
                </CheckboxLabel>
              </Checkbox>
            </Show>
          </div>

          <Show when={props.showCount}>
            <div class="flex items-center gap-2">
              <Badge variant="default" round>
                {filteredExtensions().length} shown
              </Badge>
              <Show when={!showIgnored() && ignoredCount() > 0}>
                <Badge variant="warning" round>
                  {ignoredCount()} hidden
                </Badge>
              </Show>
              <Show when={searchQuery()}>
                <Badge variant="success" round>
                  {filteredExtensions().length} of {props.extensions.length} found
                </Badge>
              </Show>
            </div>
          </Show>
        </div>

        {/* Search Bar Row */}
        <div class="flex items-center gap-3 pb-2">
          <TextField class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="ph ph-magnifying-glass text-xl text-muted-foreground" />
              </div>
              <TextFieldInput
                type="text"
                placeholder="Search extensions by name, ID, or publisher..."
                value={searchQuery()}
                onInput={(e) => handleSearchInput(e.currentTarget.value)}
                class="pl-10 pr-10"
              />
              <Show when={searchQuery()}>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
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
          <Show when={props.onLoad}>
            <Button
              onClick={() => props.onLoad?.()}
              disabled={props.loading}
              size="sm"
              class="whitespace-nowrap"
            >
              <i class="ph ph-arrows-clockwise" />
              {props.loading ? 'Loading...' : 'Reload'}
            </Button>
          </Show>
        </div>
      </div>

      <div class="flex-1 overflow-auto min-h-0 mt-4">
        <Show
          when={filteredExtensions().length > 0}
          fallback={
            <div class="text-center py-12 text-muted-foreground">
              <div class="text-4xl mb-4">
                <i class="ph ph-package" />
              </div>
              <Show
                when={searchQuery()}
                fallback={
                  <Show
                    when={showIgnored()}
                    fallback={
                      <div>
                        <p class="text-lg font-medium text-foreground">
                          All extensions are ignored
                        </p>
                        <p class="text-sm">Enable "Show ignored" to see ignored extensions.</p>
                      </div>
                    }
                  >
                    <div>
                      <p class="text-lg font-medium text-foreground">No extensions found</p>
                      <p class="text-sm">Try checking a different VS Code installation.</p>
                    </div>
                  </Show>
                }
              >
                <div>
                  <p class="text-lg font-medium text-foreground">No extensions match your search</p>
                  <p class="text-sm">Try adjusting your search terms or clearing the search.</p>
                  <Button onClick={clearSearch} size="sm" class="mt-2">
                    Clear Search
                  </Button>
                </div>
              </Show>
            </div>
          }
        >
          <div class="grid gap-4">
            <For each={filteredExtensions()}>
              {(extension) => (
                <ExtensionCard
                  extension={extension}
                  availablePacks={props.availablePacks}
                  onAddToPack={props.onAddToPack}
                  onToggleIgnore={props.onToggleIgnore}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default ExtensionList
