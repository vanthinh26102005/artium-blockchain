import { FileDown, Folder, Lock, X } from 'lucide-react'

import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'

type InventorySelectionActionsProps = {
  idsOnPage: string[]
  onMoveSelected: () => void
  onOpenExport: () => void
}

/**
 * InventorySelectionActions - React component
 * @returns React element
 */
export const InventorySelectionActions = ({
  idsOnPage,
  onMoveSelected,
  onOpenExport,
}: InventorySelectionActionsProps) => {
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const clear = useInventorySelectionStore((state) => state.clear)
  const selectAll = useInventorySelectionStore((state) => state.selectAll)
  /**
   * selectedIds - Utility function
   * @returns void
   */

  const selectedCount = selectedIds.length
  const isSelectAllDisabled = idsOnPage.length === 0

  /**
   * clear - Utility function
   * @returns void
   */
  if (selectedCount === 0) return null

  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-4 text-base font-semibold text-slate-900">
      /** * selectAll - Utility function * @returns void */
      <button
        type="button"
        onClick={() => clear()}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-slate-600 transition hover:text-slate-900"
        aria-label="Clear selection"
        /**
         * selectedCount - Utility function
         * @returns void
         */
      >
        <X className="h-5 w-5" />
      </button>
      <span>{selectedCount} selected</span>
      /** * isSelectAllDisabled - Utility function * @returns void */
      <button
        type="button"
        onClick={() => !isSelectAllDisabled && selectAll(idsOnPage)}
        disabled={isSelectAllDisabled}
        className="cursor-pointer text-slate-900 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        Select All
      </button>
      <span className="h-5 w-px bg-slate-200" />
      <button
        type="button"
        onClick={onMoveSelected}
        className="inline-flex cursor-pointer items-center gap-2 text-slate-900 transition hover:text-slate-700"
      >
        <Folder className="h-4 w-4 text-slate-500" />
        Move to folder
      </button>
      <button
        type="button"
        onClick={onOpenExport}
        className="inline-flex cursor-pointer items-center gap-2 text-slate-900 transition hover:text-slate-700"
      >
        <FileDown className="h-4 w-4 text-slate-500" />
        Export as
      </button>
      <button
        type="button"
        disabled
        className="inline-flex cursor-not-allowed items-center gap-2 text-slate-300 opacity-50"
        title="Coming soon"
      >
        <Lock className="h-4 w-4 text-slate-300" />
        Create private view
      </button>
    </div>
  )
}
