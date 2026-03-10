import type { Component } from 'solid-js'
import { createMemo } from 'solid-js'
import { useExtensionStore } from '../stores/extension'
import IgnoredExtensionsView, { type ExtensionInfo } from '../components/IgnoredExtensionsView'

const Ignored: Component = () => {
  const { extensions, ignoredExtensions, handleRemoveFromIgnored, handleClearAllIgnored } =
    useExtensionStore()

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
      <main class="flex-1 flex flex-col overflow-hidden p-6 pt-4">
        <IgnoredExtensionsView
          ignoredExtensions={ignoredExtensions()}
          onRemoveFromIgnored={handleRemoveFromIgnored}
          onClearAll={handleClearAllIgnored}
          extensionsMap={extensionsMap()}
        />
      </main>
    </div>
  )
}

export default Ignored
