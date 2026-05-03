// third-party
import { CheckCircle2, X } from 'lucide-react'

// @shared - components
import { Portal } from '@shared/components/ui/Portal'

type InventoryToastProps = {
  message: string
  onClose: () => void
}

/**
 * InventoryToast - React component
 * @returns React element
 */
export const InventoryToast = ({ message, onClose }: InventoryToastProps) => {
  // -- state --

  // -- derived --

  // -- handlers --

  // -- render --
  return (
    <Portal>
      <div className="fixed bottom-6 left-6 z-[210] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-900 shadow-lg">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-700"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Portal>
  )
}
