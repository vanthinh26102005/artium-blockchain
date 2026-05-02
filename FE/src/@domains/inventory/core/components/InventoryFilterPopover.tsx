import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover'
import { DEFAULT_INVENTORY_FILTERS, type InventoryFilters } from '@domains/inventory/core/types/inventoryFilters'

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

export type InventoryFilterPopoverProps = {
  filters: InventoryFilters
  onApplyFilters: (filters: InventoryFilters) => void
}

export const InventoryFilterPopover = ({
  filters,
  onApplyFilters,
}: InventoryFilterPopoverProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(() => buildDraftFilters(filters))
  const [priceError, setPriceError] = useState<string | null>(null)

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setDraftFilters(buildDraftFilters(filters))
      setPriceError(null)
    }
    setIsFilterOpen(open)
  }

  const handleDraftChange = (key: keyof DraftFilters, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
    setPriceError(null)
  }

  const handleCloseFilter = () => {
    setIsFilterOpen(false)
    setDraftFilters(buildDraftFilters(filters))
    setPriceError(null)
  }

  const handleApplyFilter = () => {
    const minPrice = parseNumeric(draftFilters.minPrice)
    const maxPrice = parseNumeric(draftFilters.maxPrice)
    
    if (minPrice !== undefined && minPrice < 0) {
      setPriceError('Min price cannot be negative')
      return
    }
    if (maxPrice !== undefined && maxPrice < 0) {
      setPriceError('Max price cannot be negative')
      return
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setPriceError('Min price cannot be greater than max price')
      return
    }
    
    onApplyFilters({
      status: draftFilters.status || undefined,
      minPrice,
      maxPrice,
    })
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    const resetDraft = buildDraftFilters(DEFAULT_INVENTORY_FILTERS)
    setDraftFilters(resetDraft)
    onApplyFilters(DEFAULT_INVENTORY_FILTERS)
    setIsFilterOpen(false)
  }

  return (
    <Popover open={isFilterOpen} onOpenChange={handleFilterOpenChange}>
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
                className={`h-11 rounded-xl border px-3 text-base text-slate-700 \${
                  priceError ? 'border-red-300 bg-red-50' : 'border-black/10'
                }`}
              />
              <input
                type="number"
                min="0"
                inputMode="decimal"
                placeholder="Max"
                value={draftFilters.maxPrice}
                onChange={(event) => handleDraftChange('maxPrice', event.target.value)}
                className={`h-11 rounded-xl border px-3 text-base text-slate-700 \${
                  priceError ? 'border-red-300 bg-red-50' : 'border-black/10'
                }`}
              />
            </div>
            {priceError && (
              <p className="mt-1 text-sm text-red-600">{priceError}</p>
            )}
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
  )
}
