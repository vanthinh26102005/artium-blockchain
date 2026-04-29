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
import artworkApis from '@shared/apis/artworkApis'
import artworkFolderApis from '@shared/apis/artworkFolderApis'

// @domains - inventory
import { InventoryArtworkGrid } from '@domains/inventory/components/InventoryArtworkGrid'
import { InventoryArtworkList } from '@domains/inventory/components/InventoryArtworkList'
import { InventoryPageModals } from '@domains/inventory/components/InventoryPageModals'
import { Pagination } from '@domains/inventory/components/Pagination'
import { InventoryArtworkDetailsPanel } from '@domains/inventory/components/modals/InventoryArtworkDetailsPanel'
import { InventoryToolbar } from '@domains/inventory/components/InventoryToolbar'
import { useDebounce } from '@domains/inventory/hooks/useDebounce'
import { useInventoryBootstrap } from '@domains/inventory/hooks/useInventoryBootstrap'
import { useInventoryPagination } from '@domains/inventory/hooks/useInventoryPagination'
import { useInventoryDataStore } from '@domains/inventory/stores/useInventoryDataStore'
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'
import { useInventoryUiStore } from '@domains/inventory/stores/useInventoryUiStore'
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilters,
} from '@domains/inventory/types/inventoryFilters'
import { type InventoryFolder } from '@domains/inventory/types/inventoryFolder'
import { type InventoryViewMode } from '@domains/inventory/types/inventoryUi'
import { mapArtworkToInventory } from '@domains/inventory/utils/inventoryApiMapper'
import {
  getAuctionHandoffHref,
  getEditArtworkHref,
  getProfileVisibilityPatch,
} from '@domains/inventory/utils/inventoryArtworkActions'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

type FolderWithCount = InventoryFolder & { itemCount: number }

export const InventoryFolderPage = () => {
  // -- state --
  const router = useRouter()
  const [searchName, setSearchName] = useState('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InventoryArtwork | null>(null)
  const [moveTarget, setMoveTarget] = useState<InventoryArtwork | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<InventoryArtwork | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS)
  const [folderArtworks, setFolderArtworks] = useState<InventoryArtwork[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!folderId || !user?.id) {
      setFolderArtworks([])
      setIsFetching(false)
      return
    }

    let isActive = true
    setIsFetching(true)
    setFetchError(null)
    setFolderArtworks([])

    const loadFolderArtworks = async () => {
      try {
        const response = await artworkFolderApis.getArtworksInFolder(folderId)
        const mapped = response.map(mapArtworkToInventory)

        if (!isActive) {
          return
        }

        setFolderArtworks(mapped)
        setMany([])
      } catch (error) {
        if (!isActive) {
          return
        }

        setFolderArtworks([])
        setFetchError(error instanceof Error ? error.message : 'Failed to load artworks.')
      } finally {
        if (isActive) {
          setIsFetching(false)
        }
      }
    }

    void loadFolderArtworks()

    return () => {
      isActive = false
    }
  }, [folderId, setMany, user?.id])

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

  const handleEditArtwork = (artwork: InventoryArtwork) => {
    void router.push(getEditArtworkHref(artwork))
  }

  const handleMoveArtwork = (artwork: InventoryArtwork) => {
    setMoveTarget(artwork)
  }

  const handleToggleProfileVisibility = async (artwork: InventoryArtwork) => {
    try {
      const response = await artworkApis.updateArtwork(
        artwork.id,
        getProfileVisibilityPatch(artwork),
      )
      const updatedArtwork = mapArtworkToInventory(response)
      setFolderArtworks((items) =>
        items.map((item) => (item.id === updatedArtwork.id ? updatedArtwork : item)),
      )
      setDetailsTarget((current) => (current?.id === updatedArtwork.id ? updatedArtwork : current))
      setToastMessage('Profile visibility updated.')
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'We could not update this artwork. Try again.'
      setToastMessage(message)
    }
  }

  const handleStartAuction = (artwork: InventoryArtwork) => {
    void router.push(getAuctionHandoffHref(artwork))
  }

  const handleOpenDeleteModal = (artwork: InventoryArtwork) => {
    setDeleteTarget(artwork)
  }

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    const deletedId = deleteTarget.id
    setIsDeletingArtwork(true)
    try {
      await artworkApis.deleteArtwork(deletedId)
      setFolderArtworks((items) => items.filter((artwork) => artwork.id !== deletedId))
      setMany(selectedIds.filter((id) => id !== deletedId))
      setDetailsTarget((current) => (current?.id === deletedId ? null : current))
      setToastMessage('Artwork deleted successfully.')
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'We could not delete this artwork. Try again.'
      setToastMessage(message)
    } finally {
      setIsDeletingArtwork(false)
      setDeleteTarget(null)
    }
  }

  const handleCloseMoveModal = () => {
    setMoveTarget(null)
  }

  const handleConfirmMove = async (nextFolderId?: string) => {
    if (!moveTarget) {
      return
    }

    if (!user?.id) {
      setToastMessage('Please log in to move artwork.')
      return
    }

    const targetId = moveTarget.id
    try {
      await artworkApis.bulkMoveArtworks({
        artworkIds: [targetId],
        folderId: nextFolderId ?? null,
        sellerId: user.id,
      })
      if ((nextFolderId ?? null) !== (folderId || null)) {
        setFolderArtworks((items) => items.filter((artwork) => artwork.id !== targetId))
      }
      setMany(selectedIds.filter((id) => id !== targetId))
      setToastMessage('Artwork moved successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move artwork.'
      setToastMessage(message)
    } finally {
      setMoveTarget(null)
    }
  }

  const handleMoveSelected = () => {
    const target = folderArtworks.find((artwork) => selectedIds.includes(artwork.id))

    if (target) {
      setMoveTarget(target)
    }
  }

  const handleOpenDetails = (artwork: InventoryArtwork) => {
    setDetailsTarget(artwork)
  }

  const handleCloseDetails = () => {
    setDetailsTarget(null)
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
              onMoveSelected={handleMoveSelected}
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
                onEdit={handleEditArtwork}
                onMove={handleMoveArtwork}
                onDelete={handleOpenDeleteModal}
                onOpenDetails={handleOpenDetails}
                onToggleProfileVisibility={handleToggleProfileVisibility}
                onStartAuction={handleStartAuction}
              />
            ) : (
              <InventoryArtworkList
                artworks={pageItems}
                forceFlatList
                onEdit={handleEditArtwork}
                onMove={handleMoveArtwork}
                onDelete={handleOpenDeleteModal}
                onOpenDetails={handleOpenDetails}
                onToggleProfileVisibility={handleToggleProfileVisibility}
                onStartAuction={handleStartAuction}
              />
            )}

            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </div>
        </div>
      </div>

      {/* modals */}
      <InventoryArtworkDetailsPanel
        isOpen={Boolean(detailsTarget)}
        artwork={detailsTarget}
        onClose={handleCloseDetails}
      />
      <InventoryPageModals
        isCreateFolderOpen={false}
        onCloseCreateFolder={() => {}}
        onCreateFolder={() => {}}
        isExportModalOpen={isExportModalOpen}
        onCloseExportModal={handleCloseExportModal}
        onExport={() => setToastMessage('Export started.')}
        deleteTarget={deleteTarget}
        isDeletingArtwork={isDeletingArtwork}
        onCloseDeleteModal={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        renameFolderTarget={null}
        onCloseRenameFolder={() => {}}
        onSaveRenameFolder={() => {}}
        deleteFolderTarget={null}
        onCloseDeleteFolder={() => {}}
        onConfirmDeleteFolder={() => {}}
        hideFolderTarget={null}
        onCloseHideFolder={() => {}}
        onConfirmHideFolder={() => {}}
        moveTarget={moveTarget}
        folders={folders}
        onCloseMoveModal={handleCloseMoveModal}
        onConfirmMove={handleConfirmMove}
        toastMessage={toastMessage}
        onCloseToast={() => setToastMessage(null)}
      />
    </>
  )
}
