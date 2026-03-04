import type { Component } from 'solid-js'
import { createSignal, createEffect, Show } from 'solid-js'

interface PackFormDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (
    packName: string,
    displayName: string,
    description: string,
    extensions: string[]
  ) => Promise<boolean>
  onUpdate?: (
    packName: string,
    updates: { displayName?: string; description?: string }
  ) => Promise<boolean>
  /** When provided, the dialog operates in edit mode */
  editPack?: {
    name: string
    keyword: string
    description: string
  }
}

const PackFormDialog: Component<PackFormDialogProps> = (props) => {
  const [keyword, setKeyword] = createSignal('')
  const [description, setDescription] = createSignal('')
  const [submitting, setSubmitting] = createSignal(false)
  const [error, setError] = createSignal('')

  const isEditMode = () => !!props.editPack

  // Pre-fill form when editing
  createEffect(() => {
    if (props.open && props.editPack) {
      setKeyword(props.editPack.keyword)
      setDescription(props.editPack.description)
      setError('')
    } else if (props.open) {
      setKeyword('')
      setDescription('')
      setError('')
    }
  })

  // Auto-generate display name and pack ID from keyword
  const capitalizedKeyword = () => {
    const kw = keyword().trim()
    if (!kw) return ''
    return kw.charAt(0).toUpperCase() + kw.slice(1)
  }

  const generatedDisplayName = () => {
    const cap = capitalizedKeyword()
    return cap ? `Custom Extension Pack(${cap})` : ''
  }

  const packName = () => {
    if (isEditMode()) return props.editPack!.name
    const kw = keyword().trim().toLowerCase()
    if (!kw) return ''
    const sanitized = kw
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return sanitized ? `custom-extension-pack-${sanitized}` : ''
  }

  const isValid = () => keyword().trim().length > 0 && packName().length > 0

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (!isValid() || submitting()) return

    setSubmitting(true)
    setError('')
    try {
      let success: boolean
      if (isEditMode() && props.onUpdate) {
        success = await props.onUpdate(packName(), {
          displayName: generatedDisplayName(),
          description: description().trim()
        })
      } else {
        success = await props.onCreate(packName(), generatedDisplayName(), description().trim(), [])
      }

      if (success) {
        setKeyword('')
        setDescription('')
        props.onClose()
      } else {
        setError(
          isEditMode()
            ? 'Failed to update extension pack.'
            : 'Failed to create extension pack. The name might already exist.'
        )
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose()
    }
  }

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={handleBackdropClick}
      >
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-md mx-4">
          {/* Header */}
          <div class="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 class="text-lg font-semibold text-zinc-100">
              {isEditMode() ? 'Edit Extension Pack' : 'Create Extension Pack'}
            </h2>
            <button
              onClick={() => props.onClose()}
              class="p-1 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} class="px-6 pb-6">
            <div class="space-y-4">
              {/* Keyword */}
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1">Keyword</label>
                <input
                  type="text"
                  value={keyword()}
                  onInput={(e) => setKeyword(e.currentTarget.value)}
                  placeholder="e.g. Java, Vue 3, Python"
                  class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  autofocus
                  disabled={isEditMode()}
                />
              </div>

              {/* Auto-generated Display Name & Pack ID */}
              <div class="space-y-2">
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-0.5">
                    Display Name
                    <span class="text-zinc-500 font-normal ml-1">(auto)</span>
                  </label>
                  <div class="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-300 text-sm">
                    {generatedDisplayName() || '—'}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-zinc-400 mb-0.5">
                    Pack ID
                    <span class="text-zinc-500 font-normal ml-1">(auto)</span>
                  </label>
                  <div class="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-400 text-sm font-mono">
                    {packName() || '—'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-1">
                  Description
                  <span class="text-zinc-500 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  placeholder="A brief description of this extension pack..."
                  rows={3}
                  class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none"
                />
              </div>

              {/* Error Message */}
              <Show when={error()}>
                <div class="px-3 py-2 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">
                  {error()}
                </div>
              </Show>
            </div>

            {/* Actions */}
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => props.onClose()}
                class="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid() || submitting()}
                class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Show when={submitting()}>
                  <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </Show>
                {submitting()
                  ? isEditMode()
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditMode()
                    ? 'Save'
                    : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  )
}

export default PackFormDialog
