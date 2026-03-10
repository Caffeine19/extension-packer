import type { Component } from 'solid-js'
import { createSignal, createEffect, Show } from 'solid-js'
import { Button } from './ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/Dialog'
import { TextField, TextFieldInput, TextFieldTextArea, TextFieldLabel } from './ui/TextField'

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

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode() ? 'Edit Extension Pack' : 'Create Extension Pack'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div class="space-y-4">
            {/* Keyword */}
            <TextField>
              <TextFieldLabel>Keyword</TextFieldLabel>
              <TextFieldInput
                type="text"
                value={keyword()}
                onInput={(e) => setKeyword(e.currentTarget.value)}
                placeholder="e.g. Java, Vue 3, Python"
                autofocus
                disabled={isEditMode()}
              />
            </TextField>

            {/* Auto-generated Display Name & Pack ID */}
            <div class="space-y-2">
              <TextField>
                <TextFieldLabel>
                  Display Name
                  <span class="font-normal ml-1 opacity-60">(auto)</span>
                </TextFieldLabel>
                <TextFieldInput
                  value={generatedDisplayName() || '—'}
                  readOnly
                  class="bg-muted/50"
                />
              </TextField>
              <TextField>
                <TextFieldLabel>
                  Pack ID
                  <span class="font-normal ml-1 opacity-60">(auto)</span>
                </TextFieldLabel>
                <TextFieldInput
                  value={packName() || '—'}
                  readOnly
                  class="bg-muted/50 font-mono text-muted-foreground"
                />
              </TextField>
            </div>

            {/* Description */}
            <TextField>
              <TextFieldLabel>
                Description
                <span class="font-normal ml-1 opacity-60">(optional)</span>
              </TextFieldLabel>
              <TextFieldTextArea
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                placeholder="A brief description of this extension pack..."
                rows={3}
                class="resize-none"
              />
            </TextField>

            {/* Error Message */}
            <Show when={error()}>
              <div class="px-3 py-2 bg-destructive/10 border border-destructive/50 rounded-md text-destructive text-sm">
                {error()}
              </div>
            </Show>
          </div>

          <DialogFooter class="mt-6">
            <Button type="button" variant="outline" onClick={() => props.onClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid() || submitting()}>
              <Show when={submitting()}>
                <i class="ph ph-spinner animate-spin" />
              </Show>
              {submitting()
                ? isEditMode()
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode()
                  ? 'Save'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PackFormDialog
