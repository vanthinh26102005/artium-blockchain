// react
import { useEffect, useMemo, useState } from 'react'

// next
import { useRouter } from 'next/router'
import { Plus } from 'lucide-react'

// third-party
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import { Button } from '@shared/components/ui/button'
import artworkApis from '@shared/apis/artworkApis'
import artworkFolderApis from '@shared/apis/artworkFolderApis'
import followersApis, { type FollowerObject } from '@shared/apis/followersApis'
import profileApis from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'

// @domains - inventory
import { InventoryArtistGrid } from '@domains/inventory/components/InventoryArtistGrid'
import { InventoryArtistList } from '@domains/inventory/components/InventoryArtistList'
import { InventoryArtworkGrid } from '@domains/inventory/components/InventoryArtworkGrid'
import { InventoryArtworkList } from '@domains/inventory/components/InventoryArtworkList'
import { InventoryFolderGrid } from '@domains/inventory/components/InventoryFolderGrid'
import { InventoryPageModals } from '@domains/inventory/components/InventoryPageModals'
import { Pagination } from '@domains/inventory/components/Pagination'
import { InventoryArtworkDetailsPanel } from '@domains/inventory/components/modals/InventoryArtworkDetailsPanel'
import { InventoryToolbar } from '@domains/inventory/components/InventoryToolbar'
import { UploadArtworkMenu } from '@domains/inventory/components/menus/UploadArtworkMenu'
import { useDebounce } from '@domains/inventory/hooks/useDebounce'
import { useInventoryBootstrap } from '@domains/inventory/hooks/useInventoryBootstrap'
import { useInventoryDataStore } from '@domains/inventory/stores/useInventoryDataStore'
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'
import { useInventoryUiStore } from '@domains/inventory/stores/useInventoryUiStore'
import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryFilters,
} from '@domains/inventory/types/inventoryFilters'
import { type InventoryArtwork, type DragItemData } from '@domains/inventory/types/inventoryArtwork'
import { type InventoryArtist } from '@domains/inventory/types/inventoryArtist'
import { type InventoryFolder } from '@domains/inventory/types/inventoryFolder'
import { type InventoryViewMode } from '@domains/inventory/types/inventoryUi'
import { mapFollowedArtistToInventory } from '@domains/inventory/utils/inventoryArtistMapper'
import { mapArtworkToInventory } from '@domains/inventory/utils/inventoryApiMapper'
import {
  getAuctionHandoffHref,
  getEditArtworkHref,
  getProfileVisibilityPatch,
} from '@domains/inventory/utils/inventoryArtworkActions'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { InventoryFolderCard } from '@domains/inventory/components/InventoryFolderCard'
import { InventoryArtworkGridViewItem } from '@domains/inventory/components/InventoryArtworkGridViewItem'

type FolderWithCount = InventoryFolder & { itemCount: number }

const FOLLOWED_ARTIST_ARTWORK_PREVIEW_LIMIT = 4

const loadFollowedArtist = async (relationship: FollowerObject): Promise<InventoryArtist> => {
  const followedUserId = relationship.followedUserId
  const [userResult, sellerProfileResult, artworksResult] = await Promise.allSettled([
    usersApi.getUserById(followedUserId),
    profileApis.getSellerProfileByUserId(followedUserId),
    artworkApis.listArtworksPaginated({
      sellerId: followedUserId,
      isPublished: true,
      skip: 0,
      take: FOLLOWED_ARTIST_ARTWORK_PREVIEW_LIMIT,
    }),
  ])

  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const sellerProfile =
    sellerProfileResult.status === 'fulfilled' ? sellerProfileResult.value : null
  const artworksPage =
    artworksResult.status === 'fulfilled'
      ? artworksResult.value
      : {
          data: [],
          pagination: {
            total: 0,
            skip: 0,
            take: 0,
            totalPages: 1,
            currentPage: 1,
            hasNext: false,
            hasPrev: false,
          },
        }

  return mapFollowedArtistToInventory({
    relationship,
    user,
    sellerProfile,
    artworks: artworksPage.data,
    artworkTotal: artworksPage.pagination.total,
  })
}

export const InventoryPage = () => {
  // -- hooks --
  const router = useRouter()

  // -- state --
  const [searchName, setSearchName] = useState('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InventoryArtwork | null>(null)
  const [moveTarget, setMoveTarget] = useState<InventoryArtwork | null>(null)
  const [renameFolderTarget, setRenameFolderTarget] = useState<InventoryFolder | null>(null)
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<InventoryFolder | null>(null)
  const [hideFolderTarget, setHideFolderTarget] = useState<InventoryFolder | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<InventoryArtwork | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [followedArtists, setFollowedArtists] = useState<InventoryArtist[]>([])
  const [followedArtistsTotal, setFollowedArtistsTotal] = useState(0)
  const [followedArtistsTotalPages, setFollowedArtistsTotalPages] = useState(1)
  const [isFollowedArtistsLoading, setIsFollowedArtistsLoading] = useState(false)
  const [followedArtistsError, setFollowedArtistsError] = useState<string | null>(null)
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  // DnD state — properly typed for drag overlay
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<DragItemData | null>(null)

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

  const debouncedSearchName = useDebounce(searchName, 400)
  const normalizedSearchName = debouncedSearchName.trim().toLowerCase()

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

  useEffect(() => {
    if (!user?.id) {
      setArtworks([])
      setTotal(0)
      setTotalPages(1)
      setMany([])
      setIsLoading(false)
      return
    }

    if (activeTab !== 'artworks') {
      setIsLoading(false)
      return
    }

    let isActive = true
    setIsLoading(true)

    const loadArtworks = async () => {
      try {
        const response = await artworkApis.listArtworksPaginated({
          sellerId: user.id,
          includeSellerAuctionLifecycle: true,
          q: debouncedSearchName || undefined,
          status: filters.status,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          skip: (page - 1) * pageSize,
          take: pageSize,
        })

        if (!isActive) {
          return
        }

        const mappedArtworks = response.data.map(mapArtworkToInventory)
        setArtworks(mappedArtworks)
        setTotal(response.pagination.total)
        const nextTotalPages = Math.max(1, response.pagination.totalPages)
        setTotalPages(nextTotalPages)
        if (page > nextTotalPages) {
          setPage(nextTotalPages)
        }
        setMany([])
      } catch (error) {
        if (!isActive) {
          return
        }

        setArtworks([])
        setTotal(0)
        setTotalPages(1)
        setToastMessage(error instanceof Error ? error.message : 'Failed to load artworks.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadArtworks()

    return () => {
      isActive = false
    }
  }, [
    activeTab,
    debouncedSearchName,
    filters,
    page,
    pageSize,
    refreshToken,
    setArtworks,
    setMany,
    user?.id,
  ])

  useEffect(() => {
    if (!user?.id) {
      setFollowedArtists([])
      setFollowedArtistsTotal(0)
      setFollowedArtistsTotalPages(1)
      setIsFollowedArtistsLoading(false)
      setFollowedArtistsError(null)
      return
    }

    if (activeTab !== 'artists') {
      setIsFollowedArtistsLoading(false)
      return
    }

    let isActive = true
    const currentUserId = user.id
    setIsFollowedArtistsLoading(true)
    setFollowedArtistsError(null)

    const loadFollowedArtists = async () => {
      try {
        const relationships = await followersApis.getFollowing(currentUserId, {
          skip: (page - 1) * pageSize,
          take: pageSize + 1,
        })
        const hasNextPage = relationships.length > pageSize
        const pageRelationships = relationships.slice(0, pageSize)
        const artists = await Promise.all(pageRelationships.map(loadFollowedArtist))

        if (!isActive) {
          return
        }

        setFollowedArtists(artists)
        const estimatedTotal =
          (page - 1) * pageSize + pageRelationships.length + (hasNextPage ? 1 : 0)
        setFollowedArtistsTotal(estimatedTotal)
        setFollowedArtistsTotalPages(Math.max(1, page + (hasNextPage ? 1 : 0)))
      } catch (error) {
        if (!isActive) {
          return
        }

        setFollowedArtists([])
        setFollowedArtistsTotal(0)
        setFollowedArtistsTotalPages(1)
        setFollowedArtistsError(
          error instanceof Error ? error.message : 'Failed to load followed artists.',
        )
      } finally {
        if (isActive) {
          setIsFollowedArtistsLoading(false)
        }
      }
    }

    void loadFollowedArtists()

    return () => {
      isActive = false
    }
  }, [activeTab, page, pageSize, user?.id])

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

  const handleOpenCreateFolder = () => {
    setIsCreateFolderOpen(true)
  }

  const handleCloseCreateFolder = () => {
    setIsCreateFolderOpen(false)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize)
    setPage(1)
  }

  const handleMoveArtworkToFolder = async (artworkId: string, folderId: string | null) => {
    if (!user?.id) {
      setToastMessage('Please log in to move artwork.')
      return
    }

    // Capture previous state for rollback
    const artwork = artworks.find((a) => a.id === artworkId)
    const previousFolderId = artwork?.folderId ?? null

    // Optimistic update
    optimisticMoveArtwork(artworkId, folderId ?? undefined)

    try {
      await artworkApis.bulkMoveArtworks({
        artworkIds: [artworkId],
        folderId: folderId,
        sellerId: user.id,
      })
      setToastMessage('Artwork moved to folder')
    } catch {
      // Rollback optimistic update
      optimisticMoveArtwork(artworkId, previousFolderId ?? undefined)
      setToastMessage('Failed to move artwork')
    }
  }

  const handleMoveFolderToFolder = async (folderId: string, newParentId: string | null) => {
    if (!user?.id) {
      setToastMessage('Please log in to move folder.')
      return
    }

    // Capture previous state for rollback
    const folder = folders.find((f) => f.id === folderId)
    const previousParentId = folder?.parentId ?? null

    // Optimistic update
    moveFolderToFolder(folderId, newParentId)

    try {
      await artworkFolderApis.moveFolder(folderId, {
        folderId,
        newParentId,
      })
      setToastMessage(newParentId ? 'Folder moved successfully' : 'Folder moved to root')
    } catch (error) {
      // Rollback optimistic update
      moveFolderToFolder(folderId, previousParentId)
      const message = error instanceof Error ? error.message : 'Failed to move folder'
      setToastMessage(message)
    }
  }

  const handleCreateFolder = async (name: string, _description: string) => {
    void _description

    if (!user?.id) {
      setToastMessage('Please log in to create a folder.')
      return
    }

    try {
      const created = await artworkFolderApis.createFolder({
        sellerId: user.id,
        name,
      })
      const newFolder: InventoryFolder = {
        id: created.id,
        name: created.name,
        isHidden: created.isHidden ?? false,
      }
      addFolder(newFolder)
      setToastMessage('Folder created successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create folder.'
      setToastMessage(message)
    } finally {
      setIsCreateFolderOpen(false)
    }
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
      updateArtwork(updatedArtwork)
      setDetailsTarget((current) => (current?.id === updatedArtwork.id ? updatedArtwork : current))
      setRefreshToken((value) => value + 1)
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
      removeArtwork(deletedId)
      setMany(selectedIds.filter((id) => id !== deletedId))
      setDetailsTarget((current) => (current?.id === deletedId ? null : current))
      setRefreshToken((value) => value + 1)
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

  const handleConfirmMove = async (folderId?: string) => {
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
        folderId: folderId ?? null,
        sellerId: user.id,
      })
      moveArtwork(targetId, folderId)
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
    const target = artworks.find((artwork) => selectedIds.includes(artwork.id))

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

  const handleOpenRenameFolder = (folder: InventoryFolder) => {
    setRenameFolderTarget(folder)
  }

  const handleCloseRenameFolder = () => {
    setRenameFolderTarget(null)
  }

  const handleSaveRenameFolder = async (name: string) => {
    if (!renameFolderTarget) {
      return
    }

    try {
      await artworkFolderApis.updateFolder(renameFolderTarget.id, { name })
      renameFolder(renameFolderTarget.id, name)
      setToastMessage('Folder renamed successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to rename folder.'
      setToastMessage(message)
    } finally {
      setRenameFolderTarget(null)
    }
  }

  const handleOpenDeleteFolder = (folder: InventoryFolder) => {
    setDeleteFolderTarget(folder)
  }

  const handleCloseDeleteFolder = () => {
    setDeleteFolderTarget(null)
  }

  const handleConfirmDeleteFolder = async () => {
    if (!deleteFolderTarget) {
      return
    }

    try {
      await artworkFolderApis.deleteFolder(deleteFolderTarget.id)
      removeFolder(deleteFolderTarget.id)
      setToastMessage('Folder deleted successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete folder.'
      setToastMessage(message)
    } finally {
      setDeleteFolderTarget(null)
    }
  }

  const handleOpenHideFolder = (folder: InventoryFolder) => {
    setHideFolderTarget(folder)
  }

  const handleCloseHideFolder = () => {
    setHideFolderTarget(null)
  }

  const handleConfirmHideFolder = async () => {
    if (!hideFolderTarget) {
      return
    }

    if (!user?.id) {
      setToastMessage('Please log in to hide a folder.')
      return
    }

    try {
      await artworkFolderApis.toggleVisibility(hideFolderTarget.id, {
        sellerId: user.id,
        isHidden: true,
      })
      setFolderHidden(hideFolderTarget.id, true)
      setToastMessage('Folder hidden successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to hide folder.'
      setToastMessage(message)
    } finally {
      setHideFolderTarget(null)
    }
  }

  const handleReorderFolders = async (oldIndex: number, newIndex: number) => {
    if (!user?.id) {
      setToastMessage('Please log in to reorder folders.')
      return
    }

    // Optimistic update
    reorderFolders(oldIndex, newIndex)

    // API call
    try {
      const newFolders = arrayMove(folders, oldIndex, newIndex)
      const newOrderIds = newFolders.map((f) => f.id)
      await artworkFolderApis.reorderFolders({
        sellerId: user.id,
        folderIds: newOrderIds,
      })
    } catch {
      setToastMessage('Failed to save folder order')
      // Revert by reordering back
      reorderFolders(newIndex, oldIndex)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveItem((event.active.data.current as DragItemData) ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveItem(null)

    if (!over || !user?.id) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'Folder' && overType === 'Folder') {
      if (active.id !== over.id) {
        const oldIndex = folders.findIndex((f) => f.id === active.id)
        const newIndex = folders.findIndex((f) => f.id === over.id)
        await handleReorderFolders(oldIndex, newIndex)
      }
    } else if (activeType === 'Artwork' && overType === 'Folder') {
      const artworkId = active.id as string
      const folderId = over.id as string

      // Capture previous state for rollback
      const artwork = artworks.find((a) => a.id === artworkId)
      const previousFolderId = artwork?.folderId

      // Optimistic update
      optimisticMoveArtwork(artworkId, folderId)

      try {
        await artworkApis.bulkMoveArtworks({
          artworkIds: [artworkId],
          folderId,
          sellerId: user.id,
        })
        setToastMessage('Artwork moved to folder')
      } catch {
        // Rollback optimistic update
        optimisticMoveArtwork(artworkId, previousFolderId)
        setToastMessage('Failed to move artwork')
      }
    }
  }

  useEffect(() => {
    if (bootstrapError) {
      setToastMessage(bootstrapError)
    }
  }, [bootstrapError])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchName, setPage])

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
              onClick={handleOpenCreateFolder}
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
              onMoveSelected={handleMoveSelected}
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
                    onRename={handleOpenRenameFolder}
                    onDelete={handleOpenDeleteFolder}
                    onHide={handleOpenHideFolder}
                  />
                ) : null}

                {isLoading ? (
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
                        onEdit={handleEditArtwork}
                        onMove={handleMoveArtwork}
                        onDelete={handleOpenDeleteModal}
                        onOpenDetails={handleOpenDetails}
                        onToggleProfileVisibility={handleToggleProfileVisibility}
                        onStartAuction={handleStartAuction}
                      />
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <InventoryArtworkList
                      artworks={artworks}
                      folders={foldersWithCounts}
                      onEdit={handleEditArtwork}
                      onMove={handleMoveArtwork}
                      onDelete={handleOpenDeleteModal}
                      onOpenDetails={handleOpenDetails}
                      onToggleProfileVisibility={handleToggleProfileVisibility}
                      onStartAuction={handleStartAuction}
                      onRenameFolder={handleOpenRenameFolder}
                      onDeleteFolder={handleOpenDeleteFolder}
                      onHideFolder={handleOpenHideFolder}
                      onReorderFolders={handleReorderFolders}
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
        isOpen={Boolean(detailsTarget)}
        artwork={detailsTarget}
        onClose={handleCloseDetails}
        onEdit={handleEditArtwork}
        onDelete={handleOpenDeleteModal}
        onToggleProfileVisibility={handleToggleProfileVisibility}
      />
      <InventoryPageModals
        isCreateFolderOpen={isCreateFolderOpen}
        onCloseCreateFolder={handleCloseCreateFolder}
        onCreateFolder={handleCreateFolder}
        isExportModalOpen={isExportModalOpen}
        onCloseExportModal={handleCloseExportModal}
        onExport={() => setToastMessage('Export started.')}
        deleteTarget={deleteTarget}
        isDeletingArtwork={isDeletingArtwork}
        onCloseDeleteModal={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        renameFolderTarget={renameFolderTarget}
        onCloseRenameFolder={handleCloseRenameFolder}
        onSaveRenameFolder={handleSaveRenameFolder}
        deleteFolderTarget={deleteFolderTarget}
        onCloseDeleteFolder={handleCloseDeleteFolder}
        onConfirmDeleteFolder={handleConfirmDeleteFolder}
        hideFolderTarget={hideFolderTarget}
        onCloseHideFolder={handleCloseHideFolder}
        onConfirmHideFolder={handleConfirmHideFolder}
        moveTarget={moveTarget}
        folders={folders}
        onCloseMoveModal={handleCloseMoveModal}
        onConfirmMove={handleConfirmMove}
        toastMessage={toastMessage}
        onCloseToast={() => setToastMessage(null)}
      />
    </DndContext>
  )
}
