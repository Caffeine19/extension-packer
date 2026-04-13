import type { Component } from 'solid-js'
import { onMount } from 'solid-js'
import { useSettingsStore } from '../stores/settings'
import { Checkbox, CheckboxLabel } from '../components/ui/Checkbox'

const Settings: Component = () => {
  const { settings, handleGetSettings, handleUpdateSettings } = useSettingsStore()

  onMount(() => {
    handleGetSettings()
  })

  return (
    <div class="bg-background flex flex-1 flex-col overflow-hidden">
      <main class="flex flex-1 flex-col overflow-hidden p-6 pt-4">
        <h2 class="text-2xl font-bold tracking-tight">Settings</h2>

        <div class="mt-6 space-y-6">
          <div class="flex flex-col gap-2">
            <p class="text-foreground font-mono text-sm">Use VS Code Insiders</p>

            <Checkbox
              class="items-center"
              checked={settings().useInsiders}
              onChange={(checked: boolean) => handleUpdateSettings({ useInsiders: checked })}
            >
              <CheckboxLabel class="text-muted-foreground">
                When enabled, extensions will be read from and installed to VS Code Insiders instead
                of the stable version.
              </CheckboxLabel>
            </Checkbox>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings
