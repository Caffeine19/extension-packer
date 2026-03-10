import { Toaster as SonnerToaster } from 'solid-sonner'

const Toaster = () => {
  return (
    <SonnerToaster
      theme="dark"
      class="toaster"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-background border border-border text-foreground shadow-lg rounded-lg',
          title: 'text-sm font-semibold',
          description: 'text-xs text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground text-xs',
          cancelButton: 'bg-muted text-muted-foreground text-xs',
          closeButton: 'bg-background border border-border text-foreground',
          error: 'bg-destructive/10 border-destructive/50 text-foreground',
          success: 'border-green-500/30',
          warning: 'border-yellow-500/30'
        }
      }}
    />
  )
}

export { Toaster }
