import { Component, Show, For, createMemo } from 'solid-js'
import { A, useLocation } from '@solidjs/router'

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
      icon: '🧩',
      description: 'VS Code Extensions',
      count: props.extensionsCount
    },
    {
      id: 'packs' as const,
      path: '/packs',
      label: 'Packs',
      icon: '📦',
      description: 'Extension Packs',
      count: props.packsCount
    },
    {
      id: 'ignored' as const,
      path: '/ignored',
      label: 'Ignored',
      icon: '🚫',
      description: 'Ignored Extensions',
      count: props.ignoredExtensionsCount
    }
  ])

  return (
    <div class="w-64 border-r border-zinc-800/50 h-full flex flex-col bg-zinc-900/60 backdrop-blur-xl">
      {/* Sidebar Header */}
      <div class="px-6 pt-12 pb-6 border-b border-zinc-800">
        <h1 class="text-xl font-bold text-zinc-100">Extension Manager</h1>
        <p class="text-sm text-zinc-400 mt-1">Manage VS Code extensions and packs</p>
      </div>

      {/* Navigation Items */}
      <nav class="flex-1 p-4 space-y-2">
        <For each={sidebarItems()}>
          {(item) => (
            <A
              href={item.path}
              class={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 border ${
                location.pathname === item.path
                  ? 'bg-blue-900/50 text-blue-300 border-blue-700'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 border-transparent'
              }`}
              activeClass="bg-blue-900/50 text-blue-300 border-blue-700"
              inactiveClass="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 border-transparent"
            >
              {/* Icon */}
              <span class="text-xl mr-3">{item.icon}</span>

              {/* Content */}
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-medium">{item.label}</span>

                  {/* Count Badge */}
                  <Show when={item.count() > 0}>
                    <span
                      class={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        location.pathname === item.path
                          ? 'bg-blue-800 text-blue-200'
                          : item.id === 'ignored'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.count()}
                    </span>
                  </Show>
                </div>

                <p
                  class={`text-sm mt-1 ${
                    location.pathname === item.path ? 'text-blue-400' : 'text-zinc-500'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </A>
          )}
        </For>
      </nav>

      {/* Footer */}
      <div class="p-4 border-t border-zinc-800">
        <div class="text-xs text-zinc-500 text-center">Extension Packer v1.0.0</div>
      </div>
    </div>
  )
}

export default Sidebar
