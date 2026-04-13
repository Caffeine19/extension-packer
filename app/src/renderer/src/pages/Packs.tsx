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
    buildingAll,
    installingAll,
    handleGetExtensionPacks,
    handleCreateExtensionPack,
    handleUpdateExtensionPack,
    handleDeleteExtensionPack,
    handleInstallExtensionPack,
    handleUninstallExtensionPack,
    handleBuildAllPacks,
    handleInstallAllPacks,
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
    <div class="bg-background flex flex-1 flex-col overflow-hidden">
      <div class="flex shrink-0 flex-col gap-4 px-6 pt-4 pb-2">
        <div class="flex min-h-[40px] items-center justify-between">
          <h2 class="text-2xl font-bold tracking-tight">Extension Packs</h2>
          <Show when={extensionPacks().length > 0}>
            <div class="flex items-center gap-2">
              <Show
                when={packSearchQuery()}
                fallback={
                  <Badge variant="default" round>
                    {filteredExtensionPacks().length}
                  </Badge>
                }
              >
                <Badge variant="default" round>
                  {filteredExtensionPacks().length} / {extensionPacks().length}
                </Badge>
              </Show>
            </div>
          </Show>
        </div>

        <div class="flex items-center gap-3">
          <TextField class="flex-1">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="ph ph-magnifying-glass text-muted-foreground text-xl" />
              </div>
              <TextFieldInput
                type="text"
                placeholder="Search packs by name, description, or contained extensions..."
                value={packSearchQuery()}
                onInput={(e) => handlePackSearchInput(e.currentTarget.value)}
                class="pr-10 pl-10"
              />
              <Show when={packSearchQuery()}>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
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
          <Button
            onClick={handleOpenCreate}
            size="sm"
            variant="secondary"
            class="whitespace-nowrap"
          >
            <i class="ph ph-plus" />
            Create
          </Button>
          <Button
            onClick={handleBuildAllPacks}
            disabled={buildingAll() || extensionPacks().length === 0}
            size="sm"
            variant="secondary"
            class="whitespace-nowrap"
          >
            <i class="ph ph-hammer" />
            {buildingAll() ? 'Building...' : 'Build All'}
          </Button>
          <Button
            onClick={handleInstallAllPacks}
            disabled={installingAll() || extensionPacks().length === 0}
            size="sm"
            variant="secondary"
            class="whitespace-nowrap"
          >
            <i class="ph ph-download-simple" />
            {installingAll() ? 'Installing...' : 'Install All'}
          </Button>
        </div>
      </div>

      <main class="flex-1 overflow-auto px-6 pt-4 pb-6">
        <div>
          <Show
            when={filteredExtensionPacks().length > 0}
            fallback={
              <div class="py-12 text-center">
                <div class="text-muted-foreground mb-4">
                  <i class="ph ph-package mx-auto block text-5xl" />
                </div>
                <Show
                  when={packSearchQuery()}
                  fallback={
                    <div>
                      <h3 class="mb-2 text-lg font-medium">No extension packs found</h3>
                      <p class="text-muted-foreground">
                        Click "Load Extension Packs" to scan for extension packs in your workspace
                      </p>
                    </div>
                  }
                >
                  <div>
                    <h3 class="mb-2 text-lg font-medium">No packs match your search</h3>
                    <p class="text-muted-foreground mb-4">
                      Try adjusting your search terms or clearing the search.
                    </p>
                    <Button onClick={clearPackSearch} size="sm">
                      <i class="ph ph-x" style={{ 'font-size': '16px' }} />
                      Clear Search
                    </Button>
                  </div>
                </Show>
              </div>
            }
          >
            <div class="3xl:grid-cols-3 grid grid-cols-1 gap-6 xl:grid-cols-2">
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
