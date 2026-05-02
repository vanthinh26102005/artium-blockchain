// react
import { useEffect, useMemo, useState } from 'react'

// next
import { useRouter } from 'next/router'
import { Plus } from 'lucide-react'

// third-party
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - inventory
import { InventoryArtistGrid } from '@domains/inventory/features/artists/components/InventoryArtistGrid'
import { InventoryArtistList } from '@domains/inventory/features/artists/components/InventoryArtistList'
import { InventoryArtworkGrid } from '@domains/inventory/features/artworks/components/InventoryArtworkGrid'
import { InventoryArtworkList } from '@domains/inventory/features/artworks/components/InventoryArtworkList'
import { InventoryFolderGrid } from '@domains/inventory/features/folders/components/InventoryFolderGrid'
import { InventoryPageModals } from '@domains/inventory/core/components/InventoryPageModals'
import { Pagination } from '@domains/inventory/core/components/Pagination'
import { InventoryArtworkDetailsPanel } from '@domains/inventory/features/artworks/modals/InventoryArtworkDetailsPanel'
import { InventoryToolbar } from '@domains/inventory/core/components/InventoryToolbar'
import { UploadArtworkMenu } from '@domains/inventory/core/components/menus/UploadArtworkMenu'
import { useDebounce } from '@domains/inventory/core/hooks/useDebounce'
import { useInventoryBootstrap } from '@domains/inventory/core/hooks/useInventoryBootstrap'
import { useInventoryDataStore } from '@domains/inventory/core/stores/useInventoryDataStore'
import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'
import { useInventoryUiStore } from '@domains/inventory/core/stores/useInventoryUiStore'
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilters,
} from '@domains/inventory/core/types/inventoryFilters'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'
import { type InventoryViewMode } from '@domains/inventory/core/types/inventoryUi'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { InventoryFolderCard } from '@domains/inventory/features/folders/components/InventoryFolderCard'
import { InventoryArtworkGridViewItem } from '@domains/inventory/features/artworks/components/InventoryArtworkGridViewItem'
import { useFollowedArtists } from '@domains/inventory/features/artists/hooks/useFollowedArtists'
import { useInventoryArtworks } from '@domains/inventory/features/artworks/hooks/useInventoryArtworks'
import { useArtworkActions } from '@domains/inventory/features/artworks/hooks/useArtworkActions'
import { useFolderActions } from '@domains/inventory/features/folders/hooks/useFolderActions'
import { useInventoryDnd } from '@domains/inventory/core/hooks/useInventoryDnd'
import { DragOverlay } from '@dnd-kit/core'

type FolderWithCount = InventoryFolder & { itemCount: number }

export const InventoryPage = () => {
  // -- state --
  const [searchName, setSearchName] = useState('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [refreshToken, setRefreshToken] = useState(0)

  const viewMode = useInventoryUiStore((state) => state.viewMode)
  const setViewMode = useInventoryUiStore((state) => state.setViewMode)
  const activeTab = useInventoryUiStore((state) => state.activeTab)
  const user = useAuthStore((state) => state.user)
  const artworks = useInventoryDataStore((state) => state.artworks)
  const setArtworks = useInventoryDataStore((state) => state.setArtworks)
  const updateArtwork = useInventoryDataStore((state) => state.updateArtwork)
  const folders = useInventoryDataStore((state) => state.folders)
  const addFolder = useInventoryDataStore((state) => state.addFolder)
  const removeArtwork = useInventoryDataStore((state) => state.removeArtwork)
  const moveArtwork = useInventoryDataStore((state) => state.moveArtwork)
  const renameFolder = useInventoryDataStore((state) => state.renameFolder)
  const removeFolder = useInventoryDataStore((state) => state.removeFolder)
  const setFolderHidden = useInventoryDataStore((state) => state.setFolderHidden)
  const reorderFolders = useInventoryDataStore((state) => state.reorderFolders)
  const optimisticMoveArtwork = useInventoryDataStore((state) => state.optimisticMoveArtwork)
  const moveFolderToFolder = useInventoryDataStore((state) => state.moveFolderToFolder)
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const setMany = useInventorySelectionStore((state) => state.setMany)
  const { error: bootstrapError } = useInventoryBootstrap({
    includeArtworks: false,
  })

  const {
    followedArtists,
    followedArtistsTotal,
    followedArtistsTotalPages,
    isFollowedArtistsLoading,
    followedArtistsError,
  } = useFollowedArtists(user?.id, page, pageSize, activeTab === 'artists')

  const debouncedSearchName = useDebounce(searchName, 400)
  const normalizedSearchName = debouncedSearchName.trim().toLowerCase()

  const {
    total,
    totalPages,
    isLoading: isArtworksLoading,
    error: artworksError,
  } = useInventoryArtworks(
    user?.id,
    page,
    pageSize,
    debouncedSearchName,
    filters,
    activeTab === 'artworks',
    refreshToken,
    setArtworks,
    setMany
  )

  const artworkActions = useArtworkActions({
    user,
    selectedIds,
    setMany,
    setToastMessage,
    onArtworkUpdated: (artwork) => {
      updateArtwork(artwork)
      setRefreshToken((r) => r + 1)
    },
    onArtworkDeleted: (id) => {
      removeArtwork(id)
      setRefreshToken((r) => r + 1)
    },
    onArtworkMoved: (id, folderId) => moveArtwork(id, folderId ?? undefined),
    artworks,
  })

  const folderActions = useFolderActions({
    user,
    setToastMessage,
    onFolderCreated: addFolder,
    onFolderRenamed: renameFolder,
    onFolderDeleted: removeFolder,
    onFolderHidden: setFolderHidden,
  })

  const { activeId, activeItem, handleDragStart, handleDragEnd } = useInventoryDnd({
    user,
    artworks,
    folders,
    reorderFolders,
    optimisticMoveArtwork,
    setToastMessage,
  })

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  // -- derived --
  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>()

    artworks.forEach((artwork) => {
      if (!artwork.folderId) {
        return
      }

      counts.set(artwork.folderId, (counts.get(artwork.folderId) ?? 0) + 1)
    })

    return counts
  }, [artworks])

  const foldersWithCounts = useMemo<FolderWithCount[]>(
    () =>
      folders.map((folder) => ({
        ...folder,
        itemCount: folder.itemCount ?? folderCounts.get(folder.id) ?? 0,
      })),
    [folders, folderCounts],
  )

  const filteredArtists = useMemo(() => {
    if (!normalizedSearchName) {
      return followedArtists
    }

    return followedArtists.filter((artist) =>
      [artist.name, artist.location, artist.bio]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchName)),
    )
  }, [followedArtists, normalizedSearchName])

  const idsOnPage = useMemo(() => artworks.map((artwork) => artwork.id), [artworks])
  const uncategorizedArtworks = useMemo(
    () => artworks.filter((artwork) => !artwork.folderId),
    [artworks],
  )
  const gridArtworks =
    viewMode === 'grid' && foldersWithCounts.length > 0 ? uncategorizedArtworks : artworks

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchName, filters, activeTab])

  // -- handlers --
  const handleSearchChange = (value: string) => {
    setSearchName(value)
  }

  const handleApplyFilters = (nextFilters: InventoryFilters) => {
    setFilters(nextFilters)
  }

  const handleViewModeChange = (nextViewMode: InventoryViewMode) => {
    setViewMode(nextViewMode)
  }

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true)
  }

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize)
    setPage(1)
  }

  const handleMoveArtworkToFolder = async (artworkId: string, folderId: string | null) => {
    artworkActions.handleMoveArtwork(artworks.find(a => a.id === artworkId)!)
    artworkActions.handleConfirmMove(folderId ?? undefined)
  }

  const handleMoveFolderToFolder = async (folderId: string, newParentId: string | null) => {
    // Handled by API calls similar to the previous inline logic or by extending folder actions
    // For simplicity, preserving the direct api call logic here since it's specific to the tree
    import('@shared/apis/artworkFolderApis').then(({ default: artworkFolderApis }) => {
      const folder = folders.find((f) => f.id === folderId)
      const previousParentId = folder?.parentId ?? null

      moveFolderToFolder(folderId, newParentId)

      artworkFolderApis.moveFolder(folderId, {
        folderId,
        newParentId,
      }).then(() => {
        setToastMessage(newParentId ? 'Folder moved successfully' : 'Folder moved to root')
      }).catch((error) => {
        moveFolderToFolder(folderId, previousParentId)
        const message = error instanceof Error ? error.message : 'Failed to move folder'
        setToastMessage(message)
      })
    })
  }

  useEffect(() => {
    if (bootstrapError) {
      setToastMessage(bootstrapError)
    }
  }, [bootstrapError])

  useEffect(() => {
    if (artworksError) {
      setToastMessage(artworksError)
    }
  }, [artworksError])

  useEffect(() => {
    if (!toastMessage) {
      return
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null)
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [toastMessage])

  // -- render --
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Metadata title="Inventory | Artium" />

      <div className="-mx-6 -my-1 min-h-screen sm:-mx-8 lg:-mx-12">
        {/* header */}
        <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl leading-[120%] font-semibold text-slate-900">Inventory</h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="border-primary! text-primary! hover:bg-primary/10! border font-bold!"
              onClick={folderActions.handleOpenCreateFolder}
            >
              <Plus className="h-4 w-4" />
              New folder
            </Button>
            <UploadArtworkMenu />
          </div>
        </div>

        {/* content */}
        <div className="mx-4 rounded-3xl border border-black/10 bg-white shadow-sm sm:mx-6 lg:mx-8">
          <div className="sticky top-20 z-40 rounded-t-3xl border-b border-black/10 bg-white px-6 py-5">
            <InventoryToolbar
              searchName={searchName}
              onSearchChange={handleSearchChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              filteredCount={total}
              totalCount={total}
              idsOnPage={idsOnPage}
              onMoveSelected={artworkActions.handleMoveSelected}
              onOpenExport={handleOpenExportModal}
              filters={filters}
              onApplyFilters={handleApplyFilters}
            />
          </div>

          <div className="px-6 pb-6">
            {activeTab === 'artists' ? (
              <>
                {/* artists view */}
                {followedArtistsError ? (
                  <div className="mt-4 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                    {followedArtistsError}
                  </div>
                ) : null}

                {isFollowedArtistsLoading ? (
                  <div className="mt-4 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-32 animate-pulse rounded-[28px] border border-slate-200 bg-slate-50"
                      />
                    ))}
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="mt-4">
                    <InventoryArtistList artists={filteredArtists} />
                  </div>
                ) : (
                  <div className="mt-4">
                    <InventoryArtistGrid artists={filteredArtists} />
                  </div>
                )}

                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPages={
                      normalizedSearchName
                        ? Math.max(1, Math.ceil(filteredArtists.length / pageSize))
                        : followedArtistsTotalPages
                    }
                    total={normalizedSearchName ? filteredArtists.length : followedArtistsTotal}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </>
            ) : (
              <>
                {/* artworks view */}
                {viewMode === 'grid' && foldersWithCounts.length > 0 ? (
                  <InventoryFolderGrid
                    folders={foldersWithCounts}
                    onRename={folderActions.handleOpenRenameFolder}
                    onDelete={folderActions.handleOpenDeleteFolder}
                    onHide={folderActions.handleOpenHideFolder}
                  />
                ) : null}

                {isArtworksLoading ? (
                  <div className="rounded-2xl border border-black/10 bg-white py-10 text-center text-base text-slate-500">
                    Loading...
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="mt-4">
                    {foldersWithCounts.length > 0 ? (
                      <div className="mb-3 flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Uncategorized
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {uncategorizedArtworks.length} artwork
                            {uncategorizedArtworks.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                    ) : null}

                    {foldersWithCounts.length > 0 && uncategorizedArtworks.length === 0 ? (
                      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                        <h3 className="text-base font-semibold text-slate-900">
                          No uncategorized artworks
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Artworks that are not in a folder will appear here.
                        </p>
                      </div>
                    ) : (
                      <InventoryArtworkGrid
                        artworks={gridArtworks}
                        onEdit={artworkActions.handleEditArtwork}
                        onMove={artworkActions.handleMoveArtwork}
                        onDelete={artworkActions.handleOpenDeleteModal}
                        onOpenDetails={artworkActions.handleOpenDetails}
                        onToggleProfileVisibility={artworkActions.handleToggleProfileVisibility}
                        onStartAuction={artworkActions.handleStartAuction}
                      />
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <InventoryArtworkList
                      artworks={artworks}
                      folders={foldersWithCounts}
                      onEdit={artworkActions.handleEditArtwork}
                      onMove={artworkActions.handleMoveArtwork}
                      onDelete={artworkActions.handleOpenDeleteModal}
                      onOpenDetails={artworkActions.handleOpenDetails}
                      onToggleProfileVisibility={artworkActions.handleToggleProfileVisibility}
                      onStartAuction={artworkActions.handleStartAuction}
                      onRenameFolder={folderActions.handleOpenRenameFolder}
                      onDeleteFolder={folderActions.handleOpenDeleteFolder}
                      onHideFolder={folderActions.handleOpenHideFolder}
                      onReorderFolders={reorderFolders}
                      onMoveArtworkToFolder={handleMoveArtworkToFolder}
                      onMoveFolderToFolder={handleMoveFolderToFolder}
                    />
                  </div>
                )}

                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeItem?.type === 'Folder' ? (
          <div className="w-[200px] opacity-80">
            <InventoryFolderCard
              folder={activeItem.folder}
              onRename={() => {}}
              onDelete={() => {}}
              onHide={() => {}}
            />
          </div>
        ) : activeId && activeItem?.type === 'Artwork' ? (
          <div className="w-[200px] opacity-80">
            <InventoryArtworkGridViewItem
              artwork={activeItem.artwork}
              onEdit={() => {}}
              onDelete={() => {}}
              onMove={() => {}}
              onOpenDetails={() => {}}
              onToggleProfileVisibility={() => {}}
              onStartAuction={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* modals */}
      <InventoryArtworkDetailsPanel
        isOpen={Boolean(artworkActions.detailsTarget)}
        artwork={artworkActions.detailsTarget}
        onClose={artworkActions.handleCloseDetails}
        onEdit={artworkActions.handleEditArtwork}
        onDelete={artworkActions.handleOpenDeleteModal}
        onToggleProfileVisibility={artworkActions.handleToggleProfileVisibility}
      />
      <InventoryPageModals
        isCreateFolderOpen={folderActions.isCreateFolderOpen}
        onCloseCreateFolder={folderActions.handleCloseCreateFolder}
        onCreateFolder={folderActions.handleCreateFolder}
        isExportModalOpen={isExportModalOpen}
        onCloseExportModal={handleCloseExportModal}
        onExport={() => setToastMessage('Export started.')}
        deleteTarget={artworkActions.deleteTarget}
        isDeletingArtwork={artworkActions.isDeletingArtwork}
        onCloseDeleteModal={artworkActions.handleCloseDeleteModal}
        onConfirmDelete={artworkActions.handleConfirmDelete}
        renameFolderTarget={folderActions.renameFolderTarget}
        onCloseRenameFolder={folderActions.handleCloseRenameFolder}
        onSaveRenameFolder={folderActions.handleSaveRenameFolder}
        deleteFolderTarget={folderActions.deleteFolderTarget}
        onCloseDeleteFolder={folderActions.handleCloseDeleteFolder}
        onConfirmDeleteFolder={folderActions.handleConfirmDeleteFolder}
        hideFolderTarget={folderActions.hideFolderTarget}
        onCloseHideFolder={folderActions.handleCloseHideFolder}
        onConfirmHideFolder={folderActions.handleConfirmHideFolder}
        moveTarget={artworkActions.moveTarget}
        folders={folders}
        onCloseMoveModal={artworkActions.handleCloseMoveModal}
        onConfirmMove={artworkActions.handleConfirmMove}
        toastMessage={toastMessage}
        onCloseToast={() => setToastMessage(null)}
      />
    </DndContext>
  )
}
