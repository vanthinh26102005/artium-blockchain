// third-party
import { AlertCircle } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'

type DeleteConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

/**
 * DeleteConfirmDialog - React component
 * @returns React element
 */
export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Message',
  message = 'Are you sure you want to delete this message? This action cannot be undone.',
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent size="sm" className="rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full bg-red-100 p-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
