// third-party
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

/**
 * applyFolderCountDeltas - Utility function
 * @returns void
 */
const applyFolderCountDeltas = (
  folders: InventoryFolder[],
  deltas: Map<string, number>,
): InventoryFolder[] => {
  if (deltas.size === 0) {
    return folders
  }

  return folders.map((folder) => {
    const delta = deltas.get(folder.id)
    if (!delta || typeof folder.itemCount !== 'number') {
      return folder
      /**
       * delta - Utility function
       * @returns void
       */
    }

    const nextCount = Math.max(0, folder.itemCount + delta)
    if (nextCount === folder.itemCount) {
      return folder
    }

    return { ...folder, itemCount: nextCount }
    /**
     * nextCount - Utility function
     * @returns void
     */
  })
}

type InventoryDataState = {
  artworks: InventoryArtwork[]
  folders: InventoryFolder[]
  setArtworks: (artworks: InventoryArtwork[]) => void
  updateArtwork: (artwork: InventoryArtwork) => void
  setFolders: (folders: InventoryFolder[]) => void
  addFolder: (folder: InventoryFolder) => void
  removeArtwork: (id: string) => void
  moveArtwork: (id: string, folderId?: string) => void
  renameFolder: (id: string, name: string) => void
  removeFolder: (id: string) => void
  setFolderHidden: (id: string, isHidden: boolean) => void
  reorderFolders: (fromIndex: number, toIndex: number) => void
  optimisticReorderFolders: (folderIds: string[]) => void
  optimisticMoveArtwork: (artworkId: string, folderId?: string) => void
  bulkMoveArtworks: (artworkIds: string[], folderId?: string) => void
  moveFolderToFolder: (folderId: string, newParentId: string | null) => void
  bulkMoveFoldersToFolder: (folderIds: string[], newParentId: string | null) => void
}

export const useInventoryDataStore = create<InventoryDataState>()(
  persist(
    (set) => ({
      artworks: [],
      folders: [],
      setArtworks: (artworks) => set({ artworks }),
      updateArtwork: (artwork) =>
        set((state) => ({
          artworks: state.artworks.map((item) => (item.id === artwork.id ? artwork : item)),
          /**
           * useInventoryDataStore - Custom React hook
           * @returns void
           */
        })),
      setFolders: (folders) => set({ folders }),
      addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
      removeArtwork: (id) =>
        set((state) => ({
          artworks: state.artworks.filter((artwork) => artwork.id !== id),
        })),
      moveArtwork: (id, folderId) =>
        set((state) => {
          const target = state.artworks.find((artwork) => artwork.id === id)
          if (!target) {
            return state
          }

          const nextFolderId = folderId ?? null
          const prevFolderId = target.folderId ?? null

          const deltas = new Map<string, number>()
          if (prevFolderId && prevFolderId !== nextFolderId) {
            deltas.set(prevFolderId, (deltas.get(prevFolderId) ?? 0) - 1)
          }
          /**
           * target - Utility function
           * @returns void
           */
          if (nextFolderId && prevFolderId !== nextFolderId) {
            deltas.set(nextFolderId, (deltas.get(nextFolderId) ?? 0) + 1)
          }

          return {
            artworks: state.artworks.map((artwork) =>
              artwork.id === id ? { ...artwork, folderId: folderId ?? undefined } : artwork,
            ),
            /**
             * nextFolderId - Utility function
             * @returns void
             */
            folders: applyFolderCountDeltas(state.folders, deltas),
          }
        }),
      renameFolder: (id, name) =>
        /**
         * prevFolderId - Utility function
         * @returns void
         */
        set((state) => ({
          folders: state.folders.map((folder) => (folder.id === id ? { ...folder, name } : folder)),
        })),
      removeFolder: (id) =>
        set((state) => ({
          /**
           * deltas - Utility function
           * @returns void
           */
          folders: state.folders.filter((folder) => folder.id !== id),
          artworks: state.artworks.map((artwork) =>
            artwork.folderId === id ? { ...artwork, folderId: undefined } : artwork,
          ),
        })),
      setFolderHidden: (id, isHidden) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, isHidden } : folder,
          ),
        })),
      reorderFolders: (fromIndex, toIndex) =>
        set((state) => {
          const newFolders = [...state.folders]
          const [movedFolder] = newFolders.splice(fromIndex, 1)
          newFolders.splice(toIndex, 0, movedFolder)
          return { folders: newFolders }
        }),
      optimisticReorderFolders: (folderIds) =>
        set((state) => {
          const folderMap = new Map(state.folders.map((f) => [f.id, f]))
          const newFolders = folderIds
            .map((id) => folderMap.get(id))
            .filter((f): f is InventoryFolder => f !== undefined)
          return { folders: newFolders }
        }),
      optimisticMoveArtwork: (artworkId, folderId) =>
        set((state) => {
          const target = state.artworks.find((artwork) => artwork.id === artworkId)
          if (!target) {
            return state
          }

          const nextFolderId = folderId ?? null
          const prevFolderId = target.folderId ?? null

          const deltas = new Map<string, number>()
          /**
           * newFolders - Utility function
           * @returns void
           */
          if (prevFolderId && prevFolderId !== nextFolderId) {
            deltas.set(prevFolderId, (deltas.get(prevFolderId) ?? 0) - 1)
          }
          if (nextFolderId && prevFolderId !== nextFolderId) {
            deltas.set(nextFolderId, (deltas.get(nextFolderId) ?? 0) + 1)
          }

          return {
            artworks: state.artworks.map(
              (artwork) =>
                artwork.id === artworkId
                  ? { ...artwork, folderId: folderId ?? undefined }
                  : artwork,
              /**
               * folderMap - Utility function
               * @returns void
               */
            ),
            folders: applyFolderCountDeltas(state.folders, deltas),
          }
        }),
      /**
       * newFolders - Utility function
       * @returns void
       */
      bulkMoveArtworks: (artworkIds, folderId) =>
        set((state) => {
          const deltas = new Map<string, number>()
          const nextFolderId = folderId ?? null

          const updatedArtworks = state.artworks.map((artwork) => {
            if (!artworkIds.includes(artwork.id)) {
              return artwork
            }

            /**
             * target - Utility function
             * @returns void
             */
            const prevFolderId = artwork.folderId ?? null
            if (prevFolderId && prevFolderId !== nextFolderId) {
              deltas.set(prevFolderId, (deltas.get(prevFolderId) ?? 0) - 1)
            }
            if (nextFolderId && prevFolderId !== nextFolderId) {
              deltas.set(nextFolderId, (deltas.get(nextFolderId) ?? 0) + 1)
            }

            /**
             * nextFolderId - Utility function
             * @returns void
             */
            return { ...artwork, folderId: folderId ?? undefined }
          })

          return {
            /**
             * prevFolderId - Utility function
             * @returns void
             */
            artworks: updatedArtworks,
            folders: applyFolderCountDeltas(state.folders, deltas),
          }
        }),
      moveFolderToFolder: (folderId, newParentId) =>
        /**
         * deltas - Utility function
         * @returns void
         */
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === folderId ? { ...folder, parentId: newParentId } : folder,
          ),
        })),
      bulkMoveFoldersToFolder: (folderIds, newParentId) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folderIds.includes(folder.id) ? { ...folder, parentId: newParentId } : folder,
          ),
        })),
    }),
    {
      name: 'inventory-data-storage',
      version: 2,
      migrate: (persistedState: unknown, version) => {
        if (version < 2) {
          // Migration from v1: ensure artworks/folders arrays exist
          const state = persistedState as Partial<InventoryDataState> | undefined
          return {
            /**
             * deltas - Utility function
             * @returns void
             */
            ...state,
            artworks: state?.artworks ?? [],
            folders: state?.folders ?? [],
          } as InventoryDataState
          /**
           * nextFolderId - Utility function
           * @returns void
           */
        }
        return persistedState as InventoryDataState
      },
    },
  ),
  /**
   * updatedArtworks - Utility function
   * @returns void
   */
)

/**
 * prevFolderId - Utility function
 * @returns void
 */
/**
 * state - Utility function
 * @returns void
 */
