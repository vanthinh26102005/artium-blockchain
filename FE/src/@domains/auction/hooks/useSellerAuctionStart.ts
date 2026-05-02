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
    [effectiveArtworkId, rememberedArtworkId, setTrackedArtworkId],
  )

  useEffect(() => {
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
            ? nextError.message
            : 'Could not retry the seller auction start.'
        setError(message)
        throw nextError
      } finally {
        setIsRetrying(false)
      }
    },
    [setTrackedArtworkId],
  )

  const attachTransaction = useCallback(
    async (attemptId: string, input: AttachSellerAuctionStartTxRequest) => {
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
    [setTrackedArtworkId],
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
