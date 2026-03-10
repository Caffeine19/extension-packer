import { Component, Show, For, createMemo } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { cn } from '@renderer/lib/utils'
import { Badge } from './ui/Badge'
import { Separator } from './ui/Separator'

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
      description: 'VS Code Extensions',
      count: props.extensionsCount
    },
    {
      id: 'packs' as const,
      path: '/packs',
      label: 'Packs',
      icon: 'ph ph-package',
      description: 'Extension Packs',
      count: props.packsCount
    },
    {
      id: 'ignored' as const,
      path: '/ignored',
      label: 'Ignored',
      icon: 'ph ph-prohibit',
      description: 'Ignored Extensions',
      count: props.ignoredExtensionsCount
    }
  ])

  const isActive = (path: string) =>
    location.pathname === path || (path === '/extensions' && location.pathname === '/')

  return (
    <div class="w-64 border-r border-sidebar-border/50 h-full flex flex-col bg-black/40 backdrop-blur-2xl text-sidebar-foreground">
      {/* Sidebar Header */}
      <div class="px-6 pt-12 pb-6">
        <h1 class="text-xl font-bold">Extension Manager</h1>
        <p class="text-sm text-muted-foreground mt-1">Manage VS Code extensions and packs</p>
      </div>

      <Separator />

      {/* Navigation Items */}
      <nav class="flex-1 p-4 space-y-1">
        <For each={sidebarItems()}>
          {(item) => (
            <A
              href={item.path}
              class={cn(
                'w-full flex items-center px-3 py-2.5 text-left rounded-md transition-colors duration-200',
                isActive(item.path)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <i class={`${item.icon} text-lg mr-3`} />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-sm">{item.label}</span>
                  <Show when={item.count() > 0}>
                    <Badge
                      variant={item.id === 'ignored' ? 'warning' : 'secondary'}
                      round
                      class={cn(
                        'ml-2 text-[10px] px-1.5 py-0',
                        isActive(item.path) &&
                          'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground border-transparent'
                      )}
                    >
                      {item.count()}
                    </Badge>
                  </Show>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
              </div>
            </A>
          )}
        </For>
      </nav>

      <Separator />

      {/* Footer */}
      <div class="p-4">
        <div class="text-xs text-muted-foreground text-center">Extension Packer v1.0.0</div>
      </div>
    </div>
  )
}

export default Sidebar
