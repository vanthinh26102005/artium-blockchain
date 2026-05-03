// @shared - components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'

// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

type DeleteFolderModalProps = {
  isOpen: boolean
  folder: InventoryFolder | null
  onCancel: () => void
  onConfirm: () => void
}

/**
 * DeleteFolderModal - React component
 * @returns React element
 */
export const DeleteFolderModal = ({
  isOpen,
  folder,
  onCancel,
  onConfirm,
}: DeleteFolderModalProps) => {
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
        size="lg"
        className="overflow-hidden rounded-3xl border border-white/30 bg-white/95 p-0 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6">
            <DialogHeader className="px-0 text-left">
              <DialogTitle className="text-base font-bold uppercase tracking-wider text-slate-900 lg:text-lg">
                Delete folder?
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-2 text-base text-slate-700">
            This will delete the folder{' '}
            <span className="font-semibold text-slate-900">{folderName}</span>. Any artworks inside
            will be moved back to your inventory and will no longer be grouped under this folder.
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 border-t border-black/10 text-center text-base font-semibold">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-bl-3xl py-4 text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-br-3xl border-l border-black/10 py-4 text-rose-600 transition hover:bg-rose-50"
            >
              Delete folder
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
