import type { Component } from 'solid-js'
import { Button } from './ui/Button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription
} from './ui/AlertDialog'

interface UninstallPackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  onConfirm: () => void
}

const UninstallPackDialog: Component<UninstallPackDialogProps> = (props) => {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Uninstall Extension Pack</AlertDialogTitle>
        <AlertDialogDescription>
          <p class="mb-1">Are you sure you want to uninstall</p>
          <p class="text-foreground mb-4 font-medium">{props.displayName}?</p>
          <p class="text-muted-foreground text-xs">
            You will need to restart VS Code for the change to take effect.
          </p>
        </AlertDialogDescription>
        <div class="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            <i class="ph ph-x" style={{ 'font-size': '16px' }} />
            Cancel
          </Button>
          <Button variant="destructive" onClick={props.onConfirm}>
            <i class="ph ph-upload-simple" style={{ 'font-size': '16px' }} />
            Uninstall
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default UninstallPackDialog
