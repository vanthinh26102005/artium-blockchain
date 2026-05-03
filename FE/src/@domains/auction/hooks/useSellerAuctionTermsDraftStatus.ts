import { useEffect, useState } from 'react'
import {
  SELLER_AUCTION_TERMS_DRAFT_EVENT,
  hasSellerAuctionTermsDraft,
} from '../utils/sellerAuctionTermsDraft'

type SellerAuctionTermsDraftEvent = CustomEvent<{ artworkId?: string }>

/**
 * useSellerAuctionTermsDraftStatus - Custom React hook
 * @returns void
 */
export const useSellerAuctionTermsDraftStatus = (artworkId: string) => {
  const [hasDraft, setHasDraft] = useState(() => hasSellerAuctionTermsDraft(artworkId))

  useEffect(() => {
    let isCancelled = false

    const refreshDraftStatus = () => {
      if (isCancelled) {
        return
        /**
         * refreshDraftStatus - Utility function
         * @returns void
         */
      }

      setHasDraft(hasSellerAuctionTermsDraft(artworkId))
    }

    Promise.resolve().then(refreshDraftStatus)

    const handleDraftUpdate = (event: Event) => {
      const updatedArtworkId = (event as SellerAuctionTermsDraftEvent).detail?.artworkId

      if (!updatedArtworkId || updatedArtworkId === artworkId) {
        refreshDraftStatus()
      }
      /**
       * handleDraftUpdate - Utility function
       * @returns void
       */
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.endsWith(artworkId)) {
        /**
         * updatedArtworkId - Utility function
         * @returns void
         */
        refreshDraftStatus()
      }
    }

    window.addEventListener(SELLER_AUCTION_TERMS_DRAFT_EVENT, handleDraftUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      isCancelled = true
      window.removeEventListener(SELLER_AUCTION_TERMS_DRAFT_EVENT, handleDraftUpdate)
      /**
       * handleStorage - Utility function
       * @returns void
       */
      window.removeEventListener('storage', handleStorage)
    }
  }, [artworkId])

  return hasDraft
}
