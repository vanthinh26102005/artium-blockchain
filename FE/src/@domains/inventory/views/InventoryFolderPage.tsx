// react
import { useEffect, useMemo, useState } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// third-party
import { ArrowLeft } from 'lucide-react'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - inventory
import { InventoryArtworkGrid } from '@domains/inventory/features/artworks/components/InventoryArtworkGrid'
import { InventoryArtworkList } from '@domains/inventory/features/artworks/components/InventoryArtworkList'
import { InventoryPageModals } from '@domains/inventory/core/components/InventoryPageModals'
import { Pagination } from '@domains/inventory/core/components/Pagination'
import { InventoryArtworkDetailsPanel } from '@domains/inventory/features/artworks/modals/InventoryArtworkDetailsPanel'
import { InventoryToolbar } from '@domains/inventory/core/components/InventoryToolbar'
import { useDebounce } from '@domains/inventory/core/hooks/useDebounce'
import { useInventoryBootstrap } from '@domains/inventory/core/hooks/useInventoryBootstrap'
import { useInventoryPagination } from '@domains/inventory/core/hooks/useInventoryPagination'
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
import { useInventoryFolderArtworks } from '@domains/inventory/features/artworks/hooks/useInventoryFolderArtworks'
import { useArtworkActions } from '@domains/inventory/features/artworks/hooks/useArtworkActions'

type FolderWithCount = InventoryFolder & { itemCount: number }

export const InventoryFolderPage = () => {
  // -- state --
  const router = useRouter()
  const [searchName, setSearchName] = useState('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS)

  const viewMode = useInventoryUiStore((state) => state.viewMode)
  const setViewMode = useInventoryUiStore((state) => state.setViewMode)
  const user = useAuthStore((state) => state.user)
  const folders = useInventoryDataStore((state) => state.folders)
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const setMany = useInventorySelectionStore((state) => state.setMany)
  const { error: bootstrapError } = useInventoryBootstrap({
    includeArtworks: false,
  })

  // -- derived --
  const folderId = typeof router.query.folderId === 'string' ? router.query.folderId : ''
  const activeFolder = folders.find((folder) => folder.id === folderId)
  const folderName = activeFolder?.name ?? 'Folder'

  const {
    folderArtworks,
    setFolderArtworks,
    isFetching,
    fetchError
  } = useInventoryFolderArtworks(folderId, user?.id, setMany)

  const artworkActions = useArtworkActions({
    user,
    selectedIds,
    setMany,
    setToastMessage,
    onArtworkUpdated: (artwork) => {
      setFolderArtworks((items) => items.map((item) => (item.id === artwork.id ? artwork : item)))
    },
    onArtworkDeleted: (id) => {
      setFolderArtworks((items) => items.filter((item) => item.id !== id))
    },
    onArtworkMoved: (id, targetFolderId) => {
      if (targetFolderId !== folderId) {
        setFolderArtworks((items) => items.filter((item) => item.id !== id))
      }
    },
    artworks: folderArtworks,
  })

  const folderCount = useMemo<FolderWithCount>(() => {
    return {
      id: folderId,
      name: folderName,
      description: activeFolder?.description,
      itemCount: folderArtworks.length,
    }
  }, [activeFolder?.description, folderArtworks.length, folderId, folderName])

  const debouncedSearchName = useDebounce(searchName, 400)
  const normalizedSearchName = debouncedSearchName.trim().toLowerCase()

  const filteredArtworks = useMemo(() => {
    let results = folderArtworks

    if (normalizedSearchName) {
      results = results.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(normalizedSearchName) ||
          artwork.creatorName.toLowerCase().includes(normalizedSearchName),
      )
    }

    if (filters.status) {
      results = results.filter((artwork) => artwork.backendStatus === filters.status)
    }

    if (filters.minPrice !== undefined) {
      results = results.filter((artwork) => (artwork.price ?? 0) >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter((artwork) => (artwork.price ?? 0) <= filters.maxPrice!)
    }
    return results
  }, [filters, folderArtworks, normalizedSearchName])

  const {
    page,
    pageSize,
    total,
    totalPages,
    pageItems,
    isLoading: isPaging,
    setPage,
    setPageSize,
  } = useInventoryPagination(filteredArtworks, 20, 1)

  const isLoading = isFetching || isPaging

  const idsOnPage = useMemo(() => pageItems.map((artwork) => artwork.id), [pageItems])

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

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchName, filters, folderId, setPage])

  useEffect(() => {
    if (!toastMessage) {
      return
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null)
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [toastMessage])

  useEffect(() => {
    if (bootstrapError) {
      setToastMessage(bootstrapError)
    }
  }, [bootstrapError])

  useEffect(() => {
    if (fetchError) {
      setToastMessage(fetchError)
    }
  }, [fetchError])

  // -- render --
  return (
    <>
      <Metadata title={`Inventory | ${folderName}`} />

      <div className="-mx-6 -my-4 min-h-screen sm:-mx-8 lg:-mx-12">
        <div className="mx-4 rounded-3xl border border-black/10 bg-white shadow-sm sm:mx-6 lg:mx-8">
          {/* header */}
          <div className="border-b border-black/10 bg-white px-6 py-5">
            <Button variant="outline" size="lg" asChild>
              <Link href="/inventory">
                <ArrowLeft className="h-4 w-4" />
                Back to Inventory
              </Link>
            </Button>
            <div className="mt-4">
              <p className="text-sm text-slate-500">Inventory / {folderName}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">{folderName}</h1>
              <p className="mt-1 text-sm text-[#898788]">{folderCount.itemCount} items</p>
            </div>
          </div>

          {/* toolbar */}
          <div className="sticky top-20 z-40 border-b border-black/10 bg-white px-6 py-4">
            <InventoryToolbar
              searchName={searchName}
              onSearchChange={handleSearchChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              filteredCount={filteredArtworks.length}
              totalCount={folderArtworks.length}
              idsOnPage={idsOnPage}
              onMoveSelected={artworkActions.handleMoveSelected}
              onOpenExport={handleOpenExportModal}
              filters={filters}
              onApplyFilters={handleApplyFilters}
            />
          </div>

          {/* content */}
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="rounded-2xl border border-black/10 bg-white py-10 text-center text-base text-slate-500">
                Loading...
              </div>
            ) : viewMode === 'grid' ? (
              <InventoryArtworkGrid
                artworks={pageItems}
                onEdit={artworkActions.handleEditArtwork}
                onMove={artworkActions.handleMoveArtwork}
                onDelete={artworkActions.handleOpenDeleteModal}
                onOpenDetails={artworkActions.handleOpenDetails}
                onToggleProfileVisibility={artworkActions.handleToggleProfileVisibility}
                onStartAuction={artworkActions.handleStartAuction}
              />
            ) : (
              <InventoryArtworkList
                artworks={pageItems}
                forceFlatList
                onEdit={artworkActions.handleEditArtwork}
                onMove={artworkActions.handleMoveArtwork}
                onDelete={artworkActions.handleOpenDeleteModal}
                onOpenDetails={artworkActions.handleOpenDetails}
                onToggleProfileVisibility={artworkActions.handleToggleProfileVisibility}
                onStartAuction={artworkActions.handleStartAuction}
              />
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
          </div>
        </div>
      </div>

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
        isCreateFolderOpen={false}
        onCloseCreateFolder={() => {}}
        onCreateFolder={() => {}}
        isExportModalOpen={isExportModalOpen}
        onCloseExportModal={handleCloseExportModal}
        onExport={() => setToastMessage('Export started.')}
        deleteTarget={artworkActions.deleteTarget}
        isDeletingArtwork={artworkActions.isDeletingArtwork}
        onCloseDeleteModal={artworkActions.handleCloseDeleteModal}
        onConfirmDelete={artworkActions.handleConfirmDelete}
        renameFolderTarget={null}
        onCloseRenameFolder={() => {}}
        onSaveRenameFolder={() => {}}
        deleteFolderTarget={null}
        onCloseDeleteFolder={() => {}}
        onConfirmDeleteFolder={() => {}}
        hideFolderTarget={null}
        onCloseHideFolder={() => {}}
        onConfirmHideFolder={() => {}}
        moveTarget={artworkActions.moveTarget}
        folders={folders}
        onCloseMoveModal={artworkActions.handleCloseMoveModal}
        onConfirmMove={(folderId) => artworkActions.handleConfirmMove(folderId ?? undefined)}
        toastMessage={toastMessage}
        onCloseToast={() => setToastMessage(null)}
      />
    </>
  )
}
