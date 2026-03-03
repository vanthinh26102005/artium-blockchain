// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - inventory
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'

type InventoryBulkActionsBarProps = {
  idsOnPage: string[]
  onOpenExport: () => void
}

export const InventoryBulkActionsBar = ({
  idsOnPage,
  onOpenExport,
}: InventoryBulkActionsBarProps) => {
  // -- state --
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const clear = useInventorySelectionStore((state) => state.clear)
  const selectAll = useInventorySelectionStore((state) => state.selectAll)

  // -- derived --
  const selectedCount = selectedIds.length
  const isSelectAllDisabled = idsOnPage.length === 0

  // -- handlers --
  const handleClearSelection = () => {
    clear()
  }

  const handleSelectAllOnPage = () => {
    selectAll(idsOnPage)
  }

  const handleOpenExport = () => {
    onOpenExport()
  }

  // -- render --
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 border-t border-black/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-base font-medium text-slate-900">{selectedCount} selected</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="lg" onClick={handleClearSelection}>
          Unselect
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleSelectAllOnPage}
          disabled={isSelectAllDisabled}
        >
          Select all on page
        </Button>
        <Button size="lg" onClick={handleOpenExport}>
          Export as
        </Button>
      </div>
    </div>
  )
}
