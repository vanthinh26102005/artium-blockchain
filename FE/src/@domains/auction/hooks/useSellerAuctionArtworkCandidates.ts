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

type UseSellerAuctionArtworkCandidatesArgs = {
  enabled?: boolean
}

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error('Unable to load auction eligibility.')

export const useSellerAuctionArtworkCandidates =
  ({
    enabled = true,
  }: UseSellerAuctionArtworkCandidatesArgs = {}): UseSellerAuctionArtworkCandidatesResult => {
    const [data, setData] = useState<SellerAuctionArtworkCandidatesResponse | null>(null)
    const [isLoading, setIsLoading] = useState(enabled)
    const [error, setError] = useState<Error | null>(null)

    const refresh = useCallback(async () => {
      if (!enabled) {
        setData(null)
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await auctionApis.getSellerArtworkCandidates()
        setData(response)
      } catch (err) {
        setError(toError(err))
      } finally {
        setIsLoading(false)
      }
    }, [enabled])

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
