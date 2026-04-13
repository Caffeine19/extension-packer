import { Component, Show, For, createMemo } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { cn } from '@renderer/lib/utils'
import { Badge } from './ui/Badge'
import appIcon from '@renderer/assets/icon.png'

interface SidebarProps {
  ignoredExtensionsCount: () => number
  extensionsCount: () => number
  packsCount: () => number
}

const Sidebar: Component<SidebarProps> = (props) => {
  const location = useLocation()

  const sidebarItems = createMemo(() => [
    {
      id: 'extensions' as const,
      path: '/extensions',
      label: 'Extensions',
      icon: 'ph ph-puzzle-piece',
      count: props.extensionsCount
    },
    {
      id: 'packs' as const,
      path: '/packs',
      label: 'Packs',
      icon: 'ph ph-package',
      count: props.packsCount
    },
    {
      id: 'ignored' as const,
      path: '/ignored',
      label: 'Ignored',
      icon: 'ph ph-prohibit',
      count: props.ignoredExtensionsCount
    }
  ])

  const isActive = (path: string) =>
    location.pathname === path || (path === '/extensions' && location.pathname === '/')

  return (
    <div
      class="text-sidebar-foreground flex h-full w-64 flex-col"
      style={{ '-webkit-app-region': 'drag' }}
    >
      {/* Sidebar Header */}
      <div class="pt-12 pb-6 pl-4">
        <div class="flex items-center gap-2">
          <img src={appIcon} alt="Extension Packer" class="h-10 w-10" />
          <div>
            <h1 class="text-lg font-bold">Extension Packer</h1>
            <p class="text-muted-foreground text-xs">Manage VS Code extensions</p>
          </div>
        </div>
      </div>

      <div class="mx-8 h-px bg-zinc-600/60" />

      {/* Navigation Items */}
      <nav class="flex-1 space-y-4 p-4" style={{ '-webkit-app-region': 'no-drag' }}>
        <For each={sidebarItems()}>
          {(item) => (
            <A
              href={item.path}
              class={cn(
                'flex w-full items-center rounded-md px-3 py-2.5 text-left transition-colors duration-200',
                isActive(item.path)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-primary/40 hover:text-sidebar-accent-foreground'
              )}
            >
              <i class={`${item.icon} mr-3 text-lg`} />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{item.label}</span>
                  <Show when={item.count() > 0}>
                    <Badge
                      variant={'default'}
                      round
                      class={cn(
                        'ml-2 text-[10px]',
                        isActive(item.path) &&
                          'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground border-transparent'
                      )}
                    >
                      {item.count()}
                    </Badge>
                  </Show>
                </div>
              </div>
            </A>
          )}
        </For>
      </nav>

      <div class="mx-8 h-px bg-zinc-600/60" />

      {/* Footer */}
      <div class="p-4">
        <div class="text-muted-foreground text-center font-mono text-xs">
          Extension Packer v1.0.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar
