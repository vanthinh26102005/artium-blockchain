import { useCallback, useEffect, useState } from 'react'
import auctionApis, {
  type SellerAuctionArtworkCandidate,
  type SellerAuctionArtworkCandidatesResponse,
} from '@shared/apis/auctionApis'

type UseSellerAuctionArtworkCandidatesResult = {
  data: SellerAuctionArtworkCandidatesResponse | null
  eligible: SellerAuctionArtworkCandidate[]
  blocked: SellerAuctionArtworkCandidate[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * toError - Utility function
 * @returns void
 */
const toError = (error: unknown) =>
  error instanceof Error ? error : new Error('Unable to load auction eligibility.')

export const useSellerAuctionArtworkCandidates = (): UseSellerAuctionArtworkCandidatesResult => {
  const [data, setData] = useState<SellerAuctionArtworkCandidatesResponse | null>(null)
  /**
   * useSellerAuctionArtworkCandidates - Custom React hook
   * @returns void
   */
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await auctionApis.getSellerArtworkCandidates()
      /**
       * refresh - Utility function
       * @returns void
       */
      setData(response)
    } catch (err) {
      setError(toError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * response - Utility function
   * @returns void
   */
  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    data,
    eligible: data?.eligible ?? [],
    blocked: data?.blocked ?? [],
    isLoading,
    error,
    refresh,
  }
}
