import type { Component } from 'solid-js'
import { Router, Route, type RouteSectionProps } from '@solidjs/router'
import { onMount } from 'solid-js'
import Sidebar from './components/Sidebar'
import Extensions from './pages/Extensions'
import Packs from './pages/Packs'
import Ignored from './pages/Ignored'
import { useExtensionStore } from './stores/extension'
import { usePackStore } from './stores/pack'
import { Toaster } from './components/ui/Sonner'

const Layout: Component<RouteSectionProps> = (props) => {
  const { extensions, ignoredExtensions, handleGetExtensions, handleGetIgnoredExtensions } =
    useExtensionStore()

  const { extensionPacks, handleGetExtensionPacks } = usePackStore()

  // Initialize data on app mount
  onMount(() => {
    handleGetExtensions()
    handleGetExtensionPacks()
    handleGetIgnoredExtensions()
  })

  // Memos for counts
  const extensionsCount = () => extensions().length
  const packsCount = () => extensionPacks().length
  const ignoredExtensionsCount = () => ignoredExtensions().length

  return (
    <div class="flex h-screen w-screen overflow-hidden bg-black/20">
      {/* Sidebar */}
      <Sidebar
        extensionsCount={extensionsCount}
        packsCount={packsCount}
        ignoredExtensionsCount={ignoredExtensionsCount}
      />

      <div class="flex flex-1 overflow-hidden py-2 pr-2">
        <div class="bg-background flex flex-1 flex-col overflow-hidden rounded-lg border border-zinc-600/50">
          {props.children}
        </div>
      </div>
      {/* Main Content - inset panel */}
    </div>
  )
}

const App: Component = () => {
  return (
    <>
      <Router root={Layout}>
        <Route path="/" component={() => <Extensions />} />
        <Route path="/extensions" component={() => <Extensions />} />
        <Route path="/packs" component={() => <Packs />} />
        <Route path="/ignored" component={() => <Ignored />} />
      </Router>
      <Toaster />
    </>
  )
}

export default App
