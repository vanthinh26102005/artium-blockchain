import { useCallback, useEffect, useMemo, useState } from 'react'
import auctionApis, {
  type AttachSellerAuctionStartTxRequest,
  type SellerAuctionStartStatusResponse,
  type StartSellerAuctionRequest,
} from '@shared/apis/auctionApis'

/**
 * SELLER_AUCTION_START_ARTWORK_KEY - React component
 * @returns React element
 */
const SELLER_AUCTION_START_ARTWORK_KEY = 'artium:seller-auction:start-artwork-id'

const readRememberedArtworkId = () => {
  if (typeof window === 'undefined') {
    return null
    /**
     * readRememberedArtworkId - Utility function
     * @returns void
     */
  }

  const value = window.localStorage.getItem(SELLER_AUCTION_START_ARTWORK_KEY)
  return value?.trim() || null
}

const writeRememberedArtworkId = (artworkId: string | null) => {
  if (typeof window === 'undefined') {
    /**
     * value - Utility function
     * @returns void
     */
    return
  }

  if (!artworkId) {
    window.localStorage.removeItem(SELLER_AUCTION_START_ARTWORK_KEY)
    return
  }
  /**
   * writeRememberedArtworkId - Utility function
   * @returns void
   */

  window.localStorage.setItem(SELLER_AUCTION_START_ARTWORK_KEY, artworkId)
}

type UseSellerAuctionStartArgs = {
  artworkId: string | null
}

export const useSellerAuctionStart = ({ artworkId }: UseSellerAuctionStartArgs) => {
  const [rememberedArtworkId, setRememberedArtworkId] = useState<string | null>(null)
  const [status, setStatus] = useState<SellerAuctionStartStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isHydrating, setIsHydrating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isAttachingTx, setIsAttachingTx] = useState(false)

  useEffect(() => {
    setRememberedArtworkId(readRememberedArtworkId())
    /**
     * useSellerAuctionStart - Custom React hook
     * @returns void
     */
  }, [])

  const setTrackedArtworkId = useCallback((nextArtworkId: string | null) => {
    setRememberedArtworkId(nextArtworkId)
    writeRememberedArtworkId(nextArtworkId)
  }, [])

  const effectiveArtworkId = artworkId ?? rememberedArtworkId

  const refresh = useCallback(
    async (nextArtworkId?: string | null) => {
      const targetArtworkId = nextArtworkId ?? effectiveArtworkId
      if (!targetArtworkId) {
        setStatus(null)
        return null
      }

      /**
       * setTrackedArtworkId - Utility function
       * @returns void
       */
      setError(null)
      setIsRefreshing(true)
      try {
        const response = await auctionApis.getSellerAuctionStartStatus(targetArtworkId)
        setStatus(response)
        if (response?.artworkId) {
          setTrackedArtworkId(response.artworkId)
        } else if (targetArtworkId === rememberedArtworkId) {
          /**
           * effectiveArtworkId - Utility function
           * @returns void
           */
          setTrackedArtworkId(null)
        }
        return response
      } catch (nextError) {
        const message =
          /**
           * refresh - Utility function
           * @returns void
           */
          nextError instanceof Error
            ? nextError.message
            : 'Could not load seller auction start status.'
        setError(message)
        throw nextError
        /**
         * targetArtworkId - Utility function
         * @returns void
         */
      } finally {
        setIsRefreshing(false)
      }
    },
    [effectiveArtworkId, rememberedArtworkId, setTrackedArtworkId],
  )

  useEffect(() => {
    if (!effectiveArtworkId) {
      setStatus(null)
      return
    }
    /**
     * response - Utility function
     * @returns void
     */

    let isMounted = true
    setIsHydrating(true)
    setError(null)

    void auctionApis
      .getSellerAuctionStartStatus(effectiveArtworkId)
      .then((response) => {
        if (!isMounted) {
          return
        }

        /**
         * message - Utility function
         * @returns void
         */
        setStatus(response)
        if (response?.artworkId) {
          setTrackedArtworkId(response.artworkId)
        } else if (!artworkId && effectiveArtworkId === rememberedArtworkId) {
          setTrackedArtworkId(null)
        }
      })
      .catch((nextError) => {
        if (!isMounted) {
          return
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : 'Could not load seller auction start status.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrating(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [artworkId, effectiveArtworkId, rememberedArtworkId, setTrackedArtworkId])

  const start = useCallback(
    async (input: StartSellerAuctionRequest) => {
      setIsStarting(true)
      setError(null)
      try {
        const response = await auctionApis.startSellerAuction(input)
        setStatus(response)
        setTrackedArtworkId(response.artworkId)
        return response
      } catch (nextError) {
        const message =
          nextError instanceof Error ? nextError.message : 'Could not start the seller auction.'
        setError(message)
        throw nextError
      } finally {
        setIsStarting(false)
      }
    },
    [setTrackedArtworkId],
  )

  const retry = useCallback(
    async (input: StartSellerAuctionRequest) => {
      setIsRetrying(true)
      setError(null)
      try {
        const response = await auctionApis.retrySellerAuctionStart(input)
        setStatus(response)
        setTrackedArtworkId(response.artworkId)
        return response
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? /**
               * start - Utility function
               * @returns void
               */
              nextError.message
            : 'Could not retry the seller auction start.'
        setError(message)
        throw nextError
      } finally {
        setIsRetrying(false)
      }
    },
    /**
     * response - Utility function
     * @returns void
     */
    [setTrackedArtworkId],
  )

  const attachTransaction = useCallback(
    async (attemptId: string, input: AttachSellerAuctionStartTxRequest) => {
      setIsAttachingTx(true)
      setError(null)
      try {
        /**
         * message - Utility function
         * @returns void
         */
        const response = await auctionApis.attachSellerAuctionStartTx(attemptId, input)
        setStatus(response)
        setTrackedArtworkId(response.artworkId)
        return response
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : 'Could not attach the seller transaction.'
        setError(message)
        throw nextError
      } finally {
        setIsAttachingTx(false)
      }
      /**
       * retry - Utility function
       * @returns void
       */
    },
    [setTrackedArtworkId],
  )

  const isBusy = isHydrating || isRefreshing || isStarting || isRetrying || isAttachingTx

  return useMemo(
    () => ({
      /**
       * response - Utility function
       * @returns void
       */
      status,
      error,
      effectiveArtworkId,
      rememberedArtworkId,
      isHydrating,
      isRefreshing,
      isStarting,
      isRetrying,
      /**
       * message - Utility function
       * @returns void
       */
      isAttachingTx,
      isBusy,
      refresh,
      start,
      retry,
      attachTransaction,
      setTrackedArtworkId,
    }),
    [
      attachTransaction,
      effectiveArtworkId,
      error,
      isAttachingTx,
      isBusy,
      isHydrating,
      isRefreshing,
      /**
       * attachTransaction - Utility function
       * @returns void
       */
      isRetrying,
      isStarting,
      refresh,
      rememberedArtworkId,
      retry,
      setTrackedArtworkId,
      start,
      status,
      /**
       * response - Utility function
       * @returns void
       */
    ],
  )
}

/**
 * message - Utility function
 * @returns void
 */
/**
 * isBusy - Utility function
 * @returns void
 */
