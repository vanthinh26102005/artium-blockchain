// third-party
import { Check, Loader2, X } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type SaveStatus = 'saving' | 'success'

type SaveStatusToastProps = {
  status: SaveStatus
  onClose: () => void
}

/**
 * SaveStatusToast - React component
 * @returns React element
 */
export const SaveStatusToast = ({ status, onClose }: SaveStatusToastProps) => {
  const isSaving = status === 'saving'

  return (
    /**
     * isSaving - Utility function
     * @returns void
     */
    <div className="fixed left-1/2 top-24 z-[60] -translate-x-1/2">
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-lg',
          isSaving ? 'border-slate-200' : 'border-emerald-200',
        )}
      >
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        ) : (
          <Check className="h-5 w-5 text-emerald-500" />
        )}
        <p className="text-sm font-medium text-slate-900">
          {isSaving ? 'Updating your profile...' : 'Your Profile is Updated!'}
        </p>
        {!isSaving ? (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-full p-1 text-slate-400 transition hover:text-slate-600"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
