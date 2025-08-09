import type { Component } from 'solid-js'
import { Router, Route, type RouteSectionProps } from '@solidjs/router'
import { onMount } from 'solid-js'
import Sidebar from './components/Sidebar'
import Extensions from './pages/Extensions'
import Packs from './pages/Packs'
import Ignored from './pages/Ignored'
import { useExtensionStore } from './stores/extension'
import { usePackStore } from './stores/pack'

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
    <div class="h-screen flex">
      {/* Sidebar */}
      <Sidebar
        extensionsCount={extensionsCount}
        packsCount={packsCount}
        ignoredExtensionsCount={ignoredExtensionsCount}
      />

      {/* Main Content */}
      {props.children}
    </div>
  )
}

const App: Component = () => {
  return (
    <Router root={Layout}>
      <Route path="/" component={() => <Extensions />} />
      <Route path="/extensions" component={() => <Extensions />} />
      <Route path="/packs" component={() => <Packs />} />
      <Route path="/ignored" component={() => <Ignored />} />
    </Router>
  )
}

export default App
