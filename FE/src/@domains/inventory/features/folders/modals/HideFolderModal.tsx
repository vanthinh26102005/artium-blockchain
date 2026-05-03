// @shared - components
import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog'

// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

type HideFolderModalProps = {
  isOpen: boolean
  folder: InventoryFolder | null
  onCancel: () => void
  onConfirm: () => void
}

/**
 * HideFolderModal - React component
 * @returns React element
 */
export const HideFolderModal = ({ isOpen, folder, onCancel, onConfirm }: HideFolderModalProps) => {
  // -- state --

  // -- derived --
  const folderName = folder?.name ?? 'this folder'

  // -- handlers --
  /**
   * folderName - Utility function
   * @returns void
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel()
    }
  }

  /**
   * handleOpenChange - Utility function
   * @returns void
   */
  // -- render --
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size="2xl"
        className="overflow-hidden rounded-3xl border border-white/30 bg-white/95 p-0 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-black/10 px-6 py-4">
            <DialogHeader className="px-0">
              <DialogTitle className="text-2xl font-semibold text-slate-900 lg:text-3xl">
                Hide Folder
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-base text-slate-700">
              Are you sure you want to hide{' '}
              <span className="font-semibold text-slate-900">{folderName}</span> from your profile?
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-black/10 px-6 py-4">
            <DialogFooter className="gap-3 px-0 sm:justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={onCancel}
                className="h-11 rounded-full px-8 text-base"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={onConfirm}
                className="h-11 rounded-full px-8 text-base font-semibold hover:shadow-lg"
              >
                Hide Folder
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
