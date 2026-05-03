// third-party
import { LayoutGrid, List } from 'lucide-react'

// @domains - inventory
import { type InventoryViewMode } from '@domains/inventory/core/types/inventoryUi'

type InventoryViewToggleProps = {
  viewMode: InventoryViewMode
  onChange: (viewMode: InventoryViewMode) => void
}

/**
 * InventoryViewToggle - React component
 * @returns React element
 */
export const InventoryViewToggle = ({ viewMode, onChange }: InventoryViewToggleProps) => {
  // -- state --

  // -- derived --
  const baseButtonClassName =
    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition'

  /**
   * baseButtonClassName - Utility function
   * @returns void
   */
  // -- handlers --
  const handleGridClick = () => {
    onChange('grid')
  }

  const handleListClick = () => {
    onChange('list')
    /**
     * handleGridClick - Utility function
     * @returns void
     */
  }

  // -- render --
  return (
    <div className="inline-flex items-center rounded-full border border-black/10 bg-slate-50 p-1">
      <button
        type="button"
        /**
         * handleListClick - Utility function
         * @returns void
         */
        onClick={handleGridClick}
        aria-pressed={viewMode === 'grid'}
        className={`${baseButtonClassName} ${
          viewMode === 'grid'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Grid
      </button>
      <button
        type="button"
        onClick={handleListClick}
        aria-pressed={viewMode === 'list'}
        className={`${baseButtonClassName} ${
          viewMode === 'list'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <List className="h-3.5 w-3.5" />
        List
      </button>
    </div>
  )
}
