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

/**
 * useArtworkActions - Custom React hook
 * @returns void
 */
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
  /**
   * router - Utility function
   * @returns void
   */
  const [moveTarget, setMoveTarget] = useState<InventoryArtwork | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<InventoryArtwork | null>(null)
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false)

  const handleEditArtwork = (artwork: InventoryArtwork) => {
    void router.push(getEditArtworkHref(artwork))
  }

  const handleMoveArtwork = (artwork: InventoryArtwork) => {
    setMoveTarget(artwork)
    /**
     * handleEditArtwork - Utility function
     * @returns void
     */
  }

  const handleToggleProfileVisibility = async (artwork: InventoryArtwork) => {
    try {
      const response = await artworkApis.updateArtwork(
        artwork.id,
        getProfileVisibilityPatch(artwork),
        /**
         * handleMoveArtwork - Utility function
         * @returns void
         */
      )
      const updatedArtwork = mapArtworkToInventory(response)
      onArtworkUpdated(updatedArtwork)
      setDetailsTarget((current) => (current?.id === updatedArtwork.id ? updatedArtwork : current))
      setToastMessage('Profile visibility updated.')
    } catch (error) {
      const message =
        /**
         * handleToggleProfileVisibility - Utility function
         * @returns void
         */
        error instanceof Error && error.message
          ? error.message
          : 'We could not update this artwork. Try again.'
      setToastMessage(message)
    }
    /**
     * response - Utility function
     * @returns void
     */
  }

  const handleStartAuction = (artwork: InventoryArtwork) => {
    void router.push(getAuctionHandoffHref(artwork))
  }

  const handleOpenDeleteModal = (artwork: InventoryArtwork) => {
    /**
     * updatedArtwork - Utility function
     * @returns void
     */
    setDeleteTarget(artwork)
  }

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null)
  }

  const handleConfirmDelete = async () => {
    /**
     * message - Utility function
     * @returns void
     */
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
      /**
       * handleStartAuction - Utility function
       * @returns void
       */
      setToastMessage('Artwork deleted successfully.')
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'We could not delete this artwork. Try again.'
      setToastMessage(message)
      /**
       * handleOpenDeleteModal - Utility function
       * @returns void
       */
    } finally {
      setIsDeletingArtwork(false)
      setDeleteTarget(null)
    }
  }

  const handleCloseMoveModal = () => {
    /**
     * handleCloseDeleteModal - Utility function
     * @returns void
     */
    setMoveTarget(null)
  }

  const handleConfirmMove = async (folderId?: string) => {
    if (!moveTarget) {
      return
    }
    /**
     * handleConfirmDelete - Utility function
     * @returns void
     */

    if (!user?.id) {
      setToastMessage('Please log in to move artwork.')
      return
    }

    const targetId = moveTarget.id
    try {
      /**
       * deletedId - Utility function
       * @returns void
       */
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
      /**
       * message - Utility function
       * @returns void
       */
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
    /**
     * handleCloseMoveModal - Utility function
     * @returns void
     */
  }

  const handleCloseDetails = () => {
    setDetailsTarget(null)
  }

  return {
    /**
     * handleConfirmMove - Utility function
     * @returns void
     */
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
    /**
     * targetId - Utility function
     * @returns void
     */
    handleMoveSelected,
    handleOpenDetails,
    handleCloseDetails,
  }
}

/**
 * message - Utility function
 * @returns void
 */
/**
 * handleMoveSelected - Utility function
 * @returns void
 */
/**
 * target - Utility function
 * @returns void
 */
/**
 * handleOpenDetails - Utility function
 * @returns void
 */
/**
 * handleCloseDetails - Utility function
 * @returns void
 */
