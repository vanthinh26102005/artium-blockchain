// react
import { useEffect, useState } from 'react'

// third-party
import { FileDown, Folder, LayoutGrid, List, Lock, SlidersHorizontal, X } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'

// @domains - inventory
import { InventorySearchBox } from '@domains/inventory/components/InventorySearchBox'
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'
import { useInventoryUiStore } from '@domains/inventory/stores/useInventoryUiStore'
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilters,
} from '@domains/inventory/types/inventoryFilters'
import { type InventoryViewMode } from '@domains/inventory/types/inventoryUi'

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

type DraftFilters = {
  status: string
  minPrice: string
  maxPrice: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'DELETED', label: 'Deleted' },
]

const buildDraftFilters = (filters: InventoryFilters): DraftFilters => ({
  status: filters.status ?? '',
  minPrice: filters.minPrice !== undefined ? String(filters.minPrice) : '',
  maxPrice: filters.maxPrice !== undefined ? String(filters.maxPrice) : '',
})

const parseNumeric = (value: string) => {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const InventoryToolbar = ({
  searchName,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
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
  const clear = useInventorySelectionStore((state) => state.clear)
  const selectAll = useInventorySelectionStore((state) => state.selectAll)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(() => buildDraftFilters(filters))

  // -- derived --
  const selectedCount = selectedIds.length
  const isSelectionMode = selectedCount > 0
  const isSelectAllDisabled = idsOnPage.length === 0
  const searchPlaceholder =
    activeTab === 'artists' ? 'Search by artist name' : 'Search by artwork title'
  const showFilterButton = activeTab !== 'artists'

  useEffect(() => {
    if (isFilterOpen) {
      setDraftFilters(buildDraftFilters(filters))
    }
  }, [filters, isFilterOpen])

  // -- handlers --
  const handleClearSelection = () => {
    clear()
  }

  const handleSelectAllOnPage = () => {
    if (isSelectAllDisabled) {
      return
    }

    selectAll(idsOnPage)
  }

  const handleMoveToFolder = () => {
    onMoveSelected()
  }

  const handleOpenExport = () => {
    onOpenExport()
  }

  const handleCreatePrivateView = () => {
    // Feature not yet implemented - button shows as disabled
  }

  const handleDraftChange = (key: keyof DraftFilters, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleCloseFilter = () => {
    setIsFilterOpen(false)
    setDraftFilters(buildDraftFilters(filters))
  }

  const handleApplyFilter = () => {
    onApplyFilters({
      status: draftFilters.status || undefined,
      minPrice: parseNumeric(draftFilters.minPrice),
      maxPrice: parseNumeric(draftFilters.maxPrice),
    })
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    const resetDraft = buildDraftFilters(DEFAULT_INVENTORY_FILTERS)
    setDraftFilters(resetDraft)
    onApplyFilters(DEFAULT_INVENTORY_FILTERS)
    setIsFilterOpen(false)
  }

  // -- render --
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {isSelectionMode ? (
        <div className="flex min-h-[40px] flex-wrap items-center gap-4 text-base font-semibold text-slate-900">
          <button
            type="button"
            onClick={handleClearSelection}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-slate-600 transition hover:text-slate-900"
            aria-label="Clear selection"
          >
            <X className="h-5 w-5" />
          </button>
          <span>{selectedCount} selected</span>
          <button
            type="button"
            onClick={handleSelectAllOnPage}
            disabled={isSelectAllDisabled}
            className="cursor-pointer text-slate-900 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Select All
          </button>
          <span className="h-5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={handleMoveToFolder}
            className="inline-flex cursor-pointer items-center gap-2 text-slate-900 transition hover:text-slate-700"
          >
            <Folder className="h-4 w-4 text-slate-500" />
            Move to folder
          </button>
          <button
            type="button"
            onClick={handleOpenExport}
            className="inline-flex cursor-pointer items-center gap-2 text-slate-900 transition hover:text-slate-700"
          >
            <FileDown className="h-4 w-4 text-slate-500" />
            Export as
          </button>
          <button
            type="button"
            onClick={handleCreatePrivateView}
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 text-slate-300 opacity-50"
            title="Coming soon"
          >
            <Lock className="h-4 w-4 text-slate-300" />
            Create private view
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('artworks')}
            className={`cursor-pointer rounded-full px-4 py-2 text-lg font-semibold transition ${
              activeTab === 'artworks'
                ? 'bg-slate-100 text-slate-900'
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
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Artists
          </button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="w-full max-w-md">
          <InventorySearchBox
            value={searchName}
            onChange={onSearchChange}
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
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2 rounded-xl font-semibold">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[340px] rounded-2xl border border-black/10 bg-white p-5 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-700">Filters</p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Reset
                  </button>
                </div>

                <label className="text-sm font-semibold text-slate-600">
                  Status
                  <select
                    value={draftFilters.status}
                    onChange={(event) => handleDraftChange('status', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-base text-slate-700"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <p className="text-sm font-semibold text-slate-600">Price range</p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      placeholder="Min"
                      value={draftFilters.minPrice}
                      onChange={(event) => handleDraftChange('minPrice', event.target.value)}
                      className="h-11 rounded-xl border border-black/10 px-3 text-base text-slate-700"
                    />
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      placeholder="Max"
                      value={draftFilters.maxPrice}
                      onChange={(event) => handleDraftChange('maxPrice', event.target.value)}
                      className="h-11 rounded-xl border border-black/10 px-3 text-base text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseFilter}
                    className="h-11 min-w-[120px] rounded-full border border-black/10 bg-white text-base font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    className="h-11 min-w-[120px] rounded-full bg-blue-600 text-base font-semibold text-white transition hover:bg-blue-500"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  )
}
