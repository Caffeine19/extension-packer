import type { Component } from 'solid-js'
import { Show, For, createMemo, createSignal } from 'solid-js'
import { usePackStore } from '../stores/pack'
import { useExtensionStore } from '../stores/extension'
import PackCard, { type ExtensionInfo } from '../components/PackCard'
import PackFormDialog from '../components/PackFormDialog'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { TextField, TextFieldInput } from '../components/ui/TextField'

const Packs: Component = () => {
  const {
    extensionPacks,
    packLoading,
    filteredExtensionPacks,
    packSearchQuery,
    handleGetExtensionPacks,
    handleCreateExtensionPack,
    handleUpdateExtensionPack,
    handleDeleteExtensionPack,
    handleInstallExtensionPack,
    handleUninstallExtensionPack,
    handlePackSearchInput,
    clearPackSearch
  } = usePackStore()

  const { extensions } = useExtensionStore()

  const [showDialog, setShowDialog] = createSignal(false)
  const [editingPack, setEditingPack] = createSignal<
    | {
        name: string
        keyword: string
        description: string
      }
    | undefined
  >(undefined)

  const extractKeyword = (displayName: string): string => {
    const match = displayName.match(/\((.+)\)\s*$/)
    return match ? match[1] : displayName
  }

  const handleOpenCreate = () => {
    setEditingPack(undefined)
    setShowDialog(true)
  }

  const handleOpenEdit = (pack: { name: string; displayName: string; description?: string }) => {
    setEditingPack({
      name: pack.name,
      keyword: extractKeyword(pack.displayName),
      description: pack.description || ''
    })
    setShowDialog(true)
  }

  const handleDelete = async (packName: string) => {
    await handleDeleteExtensionPack(packName)
  }

  const extensionsMap = createMemo<Record<string, ExtensionInfo>>(() => {
    const map: Record<string, ExtensionInfo> = {}
    for (const ext of extensions()) {
      map[ext.id] = {
        id: ext.id,
        name: ext.name,
        icon: ext.icon,
        publisherDisplayName: ext.publisherDisplayName
      }
    }
    return map
  })

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-background">
      <div class="shrink-0 px-6 pt-4 pb-2 flex flex-col gap-4">
        <div class="flex items-center justify-between min-h-[40px]">
          <h2 class="text-2xl font-bold tracking-tight">Extension Packs</h2>
          <Show when={extensionPacks().length > 0}>
            <div class="flex items-center gap-2">
              <Badge variant="default" round>
                {filteredExtensionPacks().length} shown
              </Badge>
              <Show when={packSearchQuery()}>
                <Badge variant="success" round>
                  {filteredExtensionPacks().length} of {extensionPacks().length} found
                </Badge>
              </Show>
            </div>
          </Show>
        </div>

        <div class="flex items-center gap-3">
          <TextField class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="ph ph-magnifying-glass text-xl text-muted-foreground" />
              </div>
              <TextFieldInput
                type="text"
                placeholder="Search packs by name, description, or contained extensions..."
                value={packSearchQuery()}
                onInput={(e) => handlePackSearchInput(e.currentTarget.value)}
                class="pl-10 pr-10"
              />
              <Show when={packSearchQuery()}>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={clearPackSearch}
                    class="text-muted-foreground hover:text-foreground focus:outline-none"
                    title="Clear search"
                  >
                    <i class="ph ph-x text-xl" />
                  </button>
                </div>
              </Show>
            </div>
          </TextField>
          <Button
            onClick={handleGetExtensionPacks}
            disabled={packLoading()}
            size="sm"
            class="whitespace-nowrap"
          >
            <i class="ph ph-arrows-clockwise" />
            {packLoading() ? 'Loading...' : 'Reload'}
          </Button>
          <Button onClick={handleOpenCreate} size="sm" class="whitespace-nowrap">
            <i class="ph ph-plus" />
            Create
          </Button>
        </div>
      </div>

      <main class="flex-1 overflow-auto px-6 pb-6 pt-4">
        <div>
          <Show
            when={filteredExtensionPacks().length > 0}
            fallback={
              <div class="text-center py-12">
                <div class="text-muted-foreground mb-4">
                  <i class="ph ph-package text-5xl block mx-auto" />
                </div>
                <Show
                  when={packSearchQuery()}
                  fallback={
                    <div>
                      <h3 class="text-lg font-medium mb-2">No extension packs found</h3>
                      <p class="text-muted-foreground">
                        Click "Load Extension Packs" to scan for extension packs in your workspace
                      </p>
                    </div>
                  }
                >
                  <div>
                    <h3 class="text-lg font-medium mb-2">No packs match your search</h3>
                    <p class="text-muted-foreground mb-4">
                      Try adjusting your search terms or clearing the search.
                    </p>
                    <Button onClick={clearPackSearch} size="sm">
                      Clear Search
                    </Button>
                  </div>
                </Show>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={filteredExtensionPacks()}>
                {(pack) => (
                  <PackCard
                    pack={pack}
                    onIconUploaded={handleGetExtensionPacks}
                    extensionsMap={extensionsMap()}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onInstall={handleInstallExtensionPack}
                    onUninstall={handleUninstallExtensionPack}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
      </main>

      <PackFormDialog
        open={showDialog()}
        onClose={() => {
          setShowDialog(false)
          setEditingPack(undefined)
        }}
        onCreate={handleCreateExtensionPack}
        onUpdate={handleUpdateExtensionPack}
        editPack={editingPack()}
      />
    </div>
  )
}

export default Packs
