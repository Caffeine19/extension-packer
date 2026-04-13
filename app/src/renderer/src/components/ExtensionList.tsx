import type { Component, JSX } from 'solid-js'
import { For, Show, createSignal, createMemo } from 'solid-js'
import ExtensionCard, { type ExtensionData, type ExtensionPack } from './ExtensionCard'
import { searchMultipleFields, createDebouncedSetter } from '../lib/searchUtils'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Checkbox, CheckboxLabel } from './ui/Checkbox'
import { TextField, TextFieldInput } from './ui/TextField'
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from './ui/Tabs'

type ExtensionTab = 'all' | 'unpacked'

interface ExtensionListProps {
  extensions: ExtensionData[]
  unpackedExtensions?: ExtensionData[]
  title?: JSX.Element
  showCount?: boolean
  availablePacks?: ExtensionPack[]
  onAddToPack?: (extensionId: string, packName: string) => void
  onToggleIgnore?: (extensionId: string, isIgnored: boolean) => void
  onLoad?: () => void
  loading?: boolean
}

const ExtensionList: Component<ExtensionListProps> = (props) => {
  const [showIgnored, setShowIgnored] = createSignal(localStorage.getItem('showIgnored') === 'true')
  const [searchQuery, setSearchQuery] = createSignal('')
  const [activeTab, setActiveTab] = createSignal<ExtensionTab>('all')

  const activeExtensions = createMemo(() => {
    if (activeTab() === 'unpacked' && props.unpackedExtensions) {
      return props.unpackedExtensions
    }
    return props.extensions
  })

  const tabTitle = createMemo(() => {
    return activeTab() === 'unpacked' ? 'Unpacked Extensions' : 'VS Code Extensions'
  })

  const updateShowIgnored = (value: boolean) => {
    setShowIgnored(value)
    localStorage.setItem('showIgnored', String(value))
  }

  const debouncedSetSearchQuery = createDebouncedSetter(setSearchQuery, 300)

  const filteredExtensions = createMemo(() => {
    let extensions = activeExtensions()

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
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 flex-col gap-4">
        {/* Top row: Title and Header Actions */}
        <div class="flex min-h-[40px] items-center justify-between">
          <div class="flex items-center gap-4">
            <Show
              when={props.unpackedExtensions}
              fallback={
                <Show when={props.title}>
                  <Show when={typeof props.title === 'string'} fallback={props.title}>
                    <h2 class="text-2xl font-bold tracking-tight">{props.title}</h2>
                  </Show>
                </Show>
              }
            >
              <h2 class="text-2xl font-bold tracking-tight">{tabTitle()}</h2>
            </Show>
          </div>

          <Show when={props.showCount}>
            <div class="flex items-center gap-2">
              <Show
                when={searchQuery()}
                fallback={
                  <Badge variant="default" round>
                    {filteredExtensions().length}
                  </Badge>
                }
              >
                <Badge variant="default" round>
                  {filteredExtensions().length} / {props.extensions.length}
                </Badge>
              </Show>
            </div>
          </Show>
        </div>

        <Show when={props.unpackedExtensions}>
          <div class="flex items-center gap-4">
            <Tabs
              value={activeTab()}
              onChange={(val) => setActiveTab(val as ExtensionTab)}
              class="w-max"
            >
              <TabsList class="w-max">
                <TabsTrigger value="all">All ({props.extensions.length})</TabsTrigger>
                <TabsTrigger value="unpacked">
                  Unpacked ({props.unpackedExtensions!.length})
                </TabsTrigger>
                <TabsIndicator />
              </TabsList>
            </Tabs>

            <Show when={ignoredCount() > 0}>
              <Checkbox checked={showIgnored()} onChange={(checked) => updateShowIgnored(checked)}>
                <CheckboxLabel class="">Show ignored ({ignoredCount()})</CheckboxLabel>
              </Checkbox>
            </Show>
          </div>
        </Show>

        {/* Search Bar Row */}
        <div class="flex items-center gap-3 pb-2">
          <TextField class="flex-1">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="ph ph-magnifying-glass text-muted-foreground text-xl" />
              </div>

              <TextFieldInput
                type="text"
                placeholder="Search extensions by name, ID, or publisher..."
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

          <Show when={props.onLoad}>
            <Button
              onClick={() => props.onLoad?.()}
              disabled={props.loading}
              size="sm"
              variant="secondary"
              class="whitespace-nowrap"
            >
              <i class="ph ph-arrows-clockwise" />
              {props.loading ? 'Loading...' : 'Reload'}
            </Button>
          </Show>
        </div>
      </div>

      <div class="mt-4 min-h-0 flex-1 overflow-auto">
        <Show
          when={filteredExtensions().length > 0}
          fallback={
            <div class="text-muted-foreground py-12 text-center">
              <div class="mb-4 text-4xl">
                <i class="ph ph-package" />
              </div>
              <Show
                when={searchQuery()}
                fallback={
                  <Show
                    when={showIgnored()}
                    fallback={
                      <div>
                        <p class="text-foreground text-lg font-medium">
                          All extensions are ignored
                        </p>
                        <p class="text-sm">Enable "Show ignored" to see ignored extensions.</p>
                      </div>
                    }
                  >
                    <div>
                      <p class="text-foreground text-lg font-medium">No extensions found</p>
                      <p class="text-sm">Try checking a different VS Code installation.</p>
                    </div>
                  </Show>
                }
              >
                <div>
                  <p class="text-foreground text-lg font-medium">No extensions match your search</p>
                  <p class="text-sm">Try adjusting your search terms or clearing the search.</p>
                  <Button onClick={clearSearch} size="sm" class="mt-2">
                    <i class="ph ph-x" style={{ 'font-size': '16px' }} />
                    Clear Search
                  </Button>
                </div>
              </Show>
            </div>
          }
        >
          <div class="3xl:grid-cols-3 grid grid-cols-1 gap-4 xl:grid-cols-2">
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
