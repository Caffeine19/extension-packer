import type { Component } from 'solid-js'
import { useExtensionStore } from '../stores/extension'
import IgnoredExtensionsView from '../components/IgnoredExtensionsView'

const Ignored: Component = () => {
  const { ignoredExtensions, handleRemoveFromIgnored, handleClearAllIgnored } = useExtensionStore()

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <main class="flex-1 overflow-auto p-6">
        <IgnoredExtensionsView
          ignoredExtensions={ignoredExtensions()}
          onRemoveFromIgnored={handleRemoveFromIgnored}
          onClearAll={handleClearAllIgnored}
        />
      </main>
    </div>
  )
}

export default Ignored
