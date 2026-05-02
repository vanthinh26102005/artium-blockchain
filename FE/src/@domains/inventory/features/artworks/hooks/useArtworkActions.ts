import { useState } from 'react'
import { useRouter } from 'next/router'

import artworkApis from '@shared/apis/artworkApis'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { mapArtworkToInventory } from '@domains/inventory/core/utils/inventoryApiMapper'
import {
  getAuctionHandoffHref,
  getEditArtworkHref,
  getProfileVisibilityPatch,
} from '@domains/inventory/features/artworks/utils/inventoryArtworkActions'
import { type UserPayload } from '@shared/types/auth'

type UseArtworkActionsProps = {
  user: UserPayload | null
  selectedIds: string[]
  setMany: (ids: string[]) => void
  setToastMessage: (msg: string | null) => void
  onArtworkUpdated: (artwork: InventoryArtwork) => void
  onArtworkDeleted: (id: string) => void
  onArtworkMoved: (id: string, folderId: string | null) => void
  artworks: InventoryArtwork[]
}

export const useArtworkActions = ({
  user,
  selectedIds,
  setMany,
  setToastMessage,
  onArtworkUpdated,
  onArtworkDeleted,
  onArtworkMoved,
  artworks,
}: UseArtworkActionsProps) => {
  const router = useRouter()

  const [deleteTarget, setDeleteTarget] = useState<InventoryArtwork | null>(null)
  const [moveTarget, setMoveTarget] = useState<InventoryArtwork | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<InventoryArtwork | null>(null)
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false)

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
      onArtworkUpdated(updatedArtwork)
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
      onArtworkDeleted(deletedId)
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
      onArtworkMoved(targetId, folderId ?? null)
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

  return {
    deleteTarget,
    moveTarget,
    detailsTarget,
    isDeletingArtwork,
    handleEditArtwork,
    handleMoveArtwork,
    handleToggleProfileVisibility,
    handleStartAuction,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleCloseMoveModal,
    handleConfirmMove,
    handleMoveSelected,
    handleOpenDetails,
    handleCloseDetails,
  }
}
