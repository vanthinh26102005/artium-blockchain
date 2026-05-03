// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - inventory
import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'

type InventoryBulkActionsBarProps = {
  idsOnPage: string[]
  onOpenExport: () => void
}

/**
 * InventoryBulkActionsBar - React component
 * @returns React element
 */
export const InventoryBulkActionsBar = ({
  idsOnPage,
  onOpenExport,
}: InventoryBulkActionsBarProps) => {
  // -- state --
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const clear = useInventorySelectionStore((state) => state.clear)
  const selectAll = useInventorySelectionStore((state) => state.selectAll)
/**
 * selectedIds - Utility function
 * @returns void
 */

  // -- derived --
  const selectedCount = selectedIds.length
  const isSelectAllDisabled = idsOnPage.length === 0
/**
 * clear - Utility function
 * @returns void
 */

  // -- handlers --
  const handleClearSelection = () => {
    clear()
/**
 * selectAll - Utility function
 * @returns void
 */
  }

  const handleSelectAllOnPage = () => {
    selectAll(idsOnPage)
  }

/**
 * selectedCount - Utility function
 * @returns void
 */
  const handleOpenExport = () => {
    onOpenExport()
  }

/**
 * isSelectAllDisabled - Utility function
 * @returns void
 */
  // -- render --
  if (selectedCount === 0) {
    return null
  }

  return (
/**
 * handleClearSelection - Utility function
 * @returns void
 */
    <div className="flex flex-col gap-3 border-t border-black/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-base font-medium text-slate-900">{selectedCount} selected</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="lg" onClick={handleClearSelection}>
          Unselect
        </Button>
        <Button
/**
 * handleSelectAllOnPage - Utility function
 * @returns void
 */
          variant="outline"
          size="lg"
          onClick={handleSelectAllOnPage}
          disabled={isSelectAllDisabled}
        >
          Select all on page
        </Button>
/**
 * handleOpenExport - Utility function
 * @returns void
 */
        <Button size="lg" onClick={handleOpenExport}>
          Export as
        </Button>
      </div>
    </div>
  )
}
