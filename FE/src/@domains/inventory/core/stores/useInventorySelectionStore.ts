// third-party
import { create } from 'zustand'

type InventorySelectionState = {
  selectedIds: string[]
  isSelected: (id: string) => boolean
  toggle: (id: string) => void
  setMany: (ids: string[]) => void
  clear: () => void
  selectAll: (idsOnPage: string[]) => void
  unselectAll: (idsOnPage: string[]) => void
}

/**
 * useInventorySelectionStore - Custom React hook
 * @returns void
 */
export const useInventorySelectionStore = create<InventorySelectionState>((set, get) => ({
  selectedIds: [],
  isSelected: (id) => get().selectedIds.includes(id),
  toggle: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),
  setMany: (ids) => set({ selectedIds: Array.from(new Set(ids)) }),
  clear: () => set({ selectedIds: [] }),
  selectAll: (idsOnPage) =>
    set((state) => ({
      selectedIds: Array.from(new Set([...state.selectedIds, ...idsOnPage])),
    })),
  unselectAll: (idsOnPage) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((id) => !idsOnPage.includes(id)),
    })),
}))
