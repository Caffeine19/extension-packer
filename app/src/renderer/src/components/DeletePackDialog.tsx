import type { Component } from 'solid-js'
import { Button } from './ui/Button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription
} from './ui/AlertDialog'

interface DeletePackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  onConfirm: () => void
}

const DeletePackDialog: Component<DeletePackDialogProps> = (props) => {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Extension Pack</AlertDialogTitle>
        <AlertDialogDescription>
          <p class="mb-1">Are you sure you want to delete</p>
          <p class="text-foreground mb-4 font-medium">{props.displayName}?</p>
          <p class="text-destructive text-xs">
            This action cannot be undone. The pack folder will be permanently removed.
          </p>
        </AlertDialogDescription>
        <div class="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            <i class="ph ph-x" style={{ 'font-size': '16px' }} />
            Cancel
          </Button>
          <Button variant="destructive" onClick={props.onConfirm}>
            <i class="ph ph-trash" style={{ 'font-size': '16px' }} />
            Delete
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeletePackDialog
