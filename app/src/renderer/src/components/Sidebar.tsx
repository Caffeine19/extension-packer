import { Component, Show } from 'solid-js'
import { A, useLocation } from '@solidjs/router'

interface SidebarProps {
  ignoredExtensionsCount: () => number
  extensionsCount: () => number
  packsCount: () => number
}

const Sidebar: Component<SidebarProps> = (props) => {
  const location = useLocation()

  const sidebarItems = [
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
  ]

  return (
    <div class="w-64  border-r border-gray-200 h-full flex flex-col">
      {/* Sidebar Header */}
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">Extension Manager</h1>
        <p class="text-sm text-gray-600 mt-1">Manage VS Code extensions and packs</p>
      </div>

      {/* Navigation Items */}
      <nav class="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <A
            href={item.path}
            class={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
            activeClass="bg-blue-50 text-blue-700 border border-blue-200"
            inactiveClass="text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
                        ? 'bg-blue-100 text-blue-800'
                        : item.id === 'ignored'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.count()}
                  </span>
                </Show>
              </div>

              <p
                class={`text-sm mt-1 ${
                  location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {item.description}
              </p>
            </div>
          </A>
        ))}
      </nav>

      {/* Footer */}
      <div class="p-4 border-t border-gray-200">
        <div class="text-xs text-gray-500 text-center">Extension Packer v1.0.0</div>
      </div>
    </div>
  )
}

export default Sidebar
