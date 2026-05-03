// third-party
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// @domains - inventory
import { type InventoryViewMode } from '@domains/inventory/core/types/inventoryUi'

type InventoryTab = 'artworks' | 'artists'

type InventoryUiState = {
  viewMode: InventoryViewMode
  activeTab: InventoryTab
  setViewMode: (viewMode: InventoryViewMode) => void
  setActiveTab: (tab: InventoryTab) => void
}

/**
 * useInventoryUiStore - Custom React hook
 * @returns void
 */
export const useInventoryUiStore = create<InventoryUiState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      activeTab: 'artworks',
      setViewMode: (viewMode) => set({ viewMode }),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'inventory-ui-storage',
    },
  ),
)

export type { InventoryTab }
