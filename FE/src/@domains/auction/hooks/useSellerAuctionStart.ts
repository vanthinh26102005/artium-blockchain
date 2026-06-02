import { useCallback, useEffect, useMemo, useState } from 'react'
import auctionApis, {
  type AttachSellerAuctionStartTxRequest,
  type SellerAuctionStartStatusResponse,
  type StartSellerAuctionRequest,
} from '@shared/apis/auctionApis'

const SELLER_AUCTION_START_ARTWORK_KEY = 'artium:seller-auction:start-artwork-id'

const readRememberedArtworkId = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(SELLER_AUCTION_START_ARTWORK_KEY)
  return value?.trim() || null
}

const writeRememberedArtworkId = (artworkId: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  if (!artworkId) {
    window.localStorage.removeItem(SELLER_AUCTION_START_ARTWORK_KEY)
    return
  }

  window.localStorage.setItem(SELLER_AUCTION_START_ARTWORK_KEY, artworkId)
}

type UseSellerAuctionStartArgs = {
  artworkId: string | null
  enabled?: boolean
}

export const useSellerAuctionStart = ({ artworkId, enabled = true }: UseSellerAuctionStartArgs) => {
  const [rememberedArtworkId, setRememberedArtworkId] = useState<string | null>(() =>
    readRememberedArtworkId(),
  )
  const [status, setStatus] = useState<SellerAuctionStartStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isHydrating, setIsHydrating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isAttachingTx, setIsAttachingTx] = useState(false)

  const setTrackedArtworkId = useCallback((nextArtworkId: string | null) => {
    setRememberedArtworkId(nextArtworkId)
    writeRememberedArtworkId(nextArtworkId)
  }, [])

  const clearTrackedArtwork = useCallback(() => {
    setStatus(null)
    setError(null)
    setTrackedArtworkId(null)
  }, [setTrackedArtworkId])

  const effectiveArtworkId = artworkId ?? rememberedArtworkId

  const refresh = useCallback(
    async (nextArtworkId?: string | null) => {
      if (!enabled) {
        setStatus(null)
        setError(null)
        return null
      }

      const targetArtworkId = nextArtworkId ?? effectiveArtworkId
      if (!targetArtworkId) {
        setStatus(null)
        return null
      }

      setError(null)
      setIsRefreshing(true)
      try {
        const response = await auctionApis.getSellerAuctionStartStatus(targetArtworkId)
        setStatus(response)
        if (response?.artworkId) {
          setTrackedArtworkId(response.artworkId)
        } else if (targetArtworkId === rememberedArtworkId) {
          setTrackedArtworkId(null)
        }
        return response
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : 'Could not load seller auction start status.'
        setError(message)
        throw nextError
      } finally {
        setIsRefreshing(false)
      }
    },
    [effectiveArtworkId, enabled, rememberedArtworkId, setTrackedArtworkId],
  )

  useEffect(() => {
    if (!enabled) {
      setStatus(null)
      setError(null)
      setIsHydrating(false)
      return
    }

    if (!effectiveArtworkId) {
      setStatus(null)
      return
    }

    let isMounted = true
    setIsHydrating(true)
    setError(null)

    void auctionApis
      .getSellerAuctionStartStatus(effectiveArtworkId)
      .then((response) => {
        if (!isMounted) {
          return
        }

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
  }, [artworkId, effectiveArtworkId, enabled, rememberedArtworkId, setTrackedArtworkId])

  const start = useCallback(
    async (input: StartSellerAuctionRequest) => {
      if (!enabled) {
        throw new Error('Seller auction start is only available to seller accounts.')
      }

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
    [enabled, setTrackedArtworkId],
  )

  const retry = useCallback(
    async (input: StartSellerAuctionRequest) => {
      if (!enabled) {
        throw new Error('Seller auction retry is only available to seller accounts.')
      }

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
            ? nextError.message
            : 'Could not retry the seller auction start.'
        setError(message)
        throw nextError
      } finally {
        setIsRetrying(false)
      }
    },
    [enabled, setTrackedArtworkId],
  )

  const attachTransaction = useCallback(
    async (attemptId: string, input: AttachSellerAuctionStartTxRequest) => {
      if (!enabled) {
        throw new Error('Seller auction transaction attach is only available to seller accounts.')
      }

      setIsAttachingTx(true)
      setError(null)
      try {
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
    },
    [enabled, setTrackedArtworkId],
  )

  const isBusy = isHydrating || isRefreshing || isStarting || isRetrying || isAttachingTx

  return useMemo(
    () => ({
      status,
      error,
      effectiveArtworkId,
      rememberedArtworkId,
      isHydrating,
      isRefreshing,
      isStarting,
      isRetrying,
      isAttachingTx,
      isBusy,
      refresh,
      start,
      retry,
      attachTransaction,
      clearTrackedArtwork,
      setTrackedArtworkId,
    }),
    [
      attachTransaction,
      clearTrackedArtwork,
      effectiveArtworkId,
      error,
      isAttachingTx,
      isBusy,
      isHydrating,
      isRefreshing,
      isRetrying,
      isStarting,
      refresh,
      rememberedArtworkId,
      retry,
      setTrackedArtworkId,
      start,
      status,
    ],
  )
}
