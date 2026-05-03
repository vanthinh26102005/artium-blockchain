// react
import { useState } from 'react'

// third-party
import { FileDown, Folder, LayoutGrid, List, Lock, SlidersHorizontal, X } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'

// @domains - inventory
import { InventorySearchBox } from '@domains/inventory/core/components/InventorySearchBox'
import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'
import { useInventoryUiStore } from '@domains/inventory/core/stores/useInventoryUiStore'
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilters,
} from '@domains/inventory/core/types/inventoryFilters'
import { type InventoryViewMode } from '@domains/inventory/core/types/inventoryUi'
import { InventoryFilterPopover } from '@domains/inventory/core/components/InventoryFilterPopover'
import { InventorySelectionActions } from '@domains/inventory/core/components/InventorySelectionActions'

type InventoryToolbarProps = {
  searchName: string
  onSearchChange: (value: string) => void
  viewMode: InventoryViewMode
  onViewModeChange: (viewMode: InventoryViewMode) => void
  filteredCount: number
  totalCount: number
  idsOnPage: string[]
  onMoveSelected: () => void
  onOpenExport: () => void
  filters: InventoryFilters
  onApplyFilters: (filters: InventoryFilters) => void
}

/**
 * InventoryToolbar - React component
 * @returns React element
 */
export const InventoryToolbar = ({
  searchName,
  onSearchChange,
  viewMode,
  onViewModeChange,
  idsOnPage,
  onMoveSelected,
  onOpenExport,
  filters,
  onApplyFilters,
}: InventoryToolbarProps) => {
  // -- state --
  const activeTab = useInventoryUiStore((state) => state.activeTab)
  const setActiveTab = useInventoryUiStore((state) => state.setActiveTab)
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  /**
   * activeTab - Utility function
   * @returns void
   */
  const clear = useInventorySelectionStore((state) => state.clear)
  const selectAll = useInventorySelectionStore((state) => state.selectAll)

  // -- derived --
  /**
   * setActiveTab - Utility function
   * @returns void
   */
  const selectedCount = selectedIds.length
  const isSelectionMode = selectedCount > 0
  const isSelectAllDisabled = idsOnPage.length === 0
  const searchPlaceholder =
    /**
     * selectedIds - Utility function
     * @returns void
     */
    activeTab === 'artists' ? 'Search by artist name' : 'Search by artwork title'
  const showFilterButton = activeTab !== 'artists'

  // -- handlers --
  /**
   * clear - Utility function
   * @returns void
   */
  const handleClearSelection = () => {
    clear()
  }

  /**
   * selectAll - Utility function
   * @returns void
   */
  const handleSelectAllOnPage = () => {
    if (isSelectAllDisabled) {
      return
    }

    selectAll(idsOnPage)
    /**
     * selectedCount - Utility function
     * @returns void
     */
  }

  const handleMoveToFolder = () => {
    onMoveSelected()
    /**
     * isSelectionMode - Utility function
     * @returns void
     */
  }

  const handleOpenExport = () => {
    onOpenExport()
    /**
     * isSelectAllDisabled - Utility function
     * @returns void
     */
  }

  const handleCreatePrivateView = () => {
    // Feature not yet implemented - button shows as disabled
    /**
     * searchPlaceholder - Utility function
     * @returns void
     */
  }

  // -- render --
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      /** * showFilterButton - Utility function * @returns void */
      {isSelectionMode ? (
        <InventorySelectionActions
          idsOnPage={idsOnPage}
          onMoveSelected={onMoveSelected}
          onOpenExport={onOpenExport}
        />
      ) : (
        /**
         * handleClearSelection - Utility function
         * @returns void
         */
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('artworks')}
            className={`cursor-pointer rounded-full px-4 py-2 text-lg font-semibold transition ${
              activeTab === 'artworks'
                ? /**
                   * handleSelectAllOnPage - Utility function
                   * @returns void
                   */
                  'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Artworks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('artists')}
            className={`cursor-pointer rounded-full px-4 py-2 text-lg font-semibold transition ${
              activeTab === 'artists'
                ? /**
                   * handleMoveToFolder - Utility function
                   * @returns void
                   */
                  'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Followed artists
          </button>
        </div>
        /**
         * handleOpenExport - Utility function
         * @returns void
         */
      )}
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="w-full max-w-md">
          <InventorySearchBox
            value={searchName}
            onChange={onSearchChange}
            /**
             * handleCreatePrivateView - Utility function
             * @returns void
             */
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center transition ${
              viewMode === 'list'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center border-l border-slate-200 transition ${
              viewMode === 'grid'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
        {showFilterButton ? (
          <InventoryFilterPopover filters={filters} onApplyFilters={onApplyFilters} />
        ) : null}
      </div>
    </div>
  )
}
