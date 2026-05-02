import { type InventoryTab } from '@domains/inventory/core/stores/useInventoryUiStore'

type InventoryTabsProps = {
  activeTab: InventoryTab
  onTabChange: (tab: InventoryTab) => void
}

export const InventoryTabs = ({ activeTab, onTabChange }: InventoryTabsProps) => {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onTabChange('artworks')}
        className={`px-4 py-2 text-base font-semibold transition ${
          activeTab === 'artworks'
            ? 'border-b-2 border-blue-600 text-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Artworks
      </button>
      <button
        onClick={() => onTabChange('artists')}
        className={`px-4 py-2 text-base font-semibold transition ${
          activeTab === 'artists'
            ? 'border-b-2 border-blue-600 text-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Artists
      </button>
    </div>
  )
}
