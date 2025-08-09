import { createSignal } from 'solid-js'

// App-level state
const [activeTab, setActiveTab] = createSignal<'extensions' | 'packs' | 'ignored'>('extensions')

export const useAppStore = () => ({
  // State
  activeTab,
  setActiveTab
})
