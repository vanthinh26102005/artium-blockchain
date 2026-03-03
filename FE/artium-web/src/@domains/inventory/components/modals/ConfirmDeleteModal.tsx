// @shared - components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'

type ConfirmDeleteModalProps = {
  isOpen: boolean
  artworkTitle: string
  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmDeleteModal = ({
  isOpen,
  artworkTitle,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) => {
  // -- state --

  // -- derived --

  // -- handlers --
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel()
    }
  }

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
              <DialogTitle className="text-base font-bold tracking-wider text-slate-900 uppercase lg:text-lg">
                Delete artwork?
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 pt-2 pb-6 text-base text-slate-700">
            This will delete the artwork{' '}
            <span className="font-semibold text-slate-900">{artworkTitle}</span>. This action cannot
            be undone.
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
              Delete artwork
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
