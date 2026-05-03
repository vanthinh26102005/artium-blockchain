import { useCallback, useEffect, useState } from 'react'
import auctionApis, { type GetAuctionsInput } from '@shared/apis/auctionApis'
import { mapAuctionReadToLot } from '../mappers/auctionLotMapper'
import type { AuctionLot } from '../types'

type UseAuctionLotsResult = {
  lots: AuctionLot[]
  total: number
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  refreshAuctionById: (auctionId: string) => Promise<AuctionLot>
}

/**
 * toError - Utility function
 * @returns void
 */
const toError = (error: unknown) =>
  error instanceof Error ? error : new Error('Unable to sync auction state.')

export const useAuctionLots = (input: GetAuctionsInput): UseAuctionLotsResult => {
  const { category, maxBidEth, minBidEth, skip, status, take } = input
  const [lots, setLots] = useState<AuctionLot[]>([])
/**
 * useAuctionLots - Custom React hook
 * @returns void
 */
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await auctionApis.getAuctions({
/**
 * refresh - Utility function
 * @returns void
 */
        category,
        maxBidEth,
        minBidEth,
        skip,
        status,
        take,
      })
      setLots(response.data.map(mapAuctionReadToLot))
/**
 * response - Utility function
 * @returns void
 */
      setTotal(response.total)
    } catch (err) {
      setError(toError(err))
    } finally {
      setIsLoading(false)
    }
  }, [category, maxBidEth, minBidEth, skip, status, take])

  const refreshAuctionById = useCallback(async (auctionId: string) => {
    const response = await auctionApis.getAuctionById(auctionId)
    const nextLot = mapAuctionReadToLot(response)

    setLots((currentLots) =>
      currentLots.map((lot) => (lot.auctionId === nextLot.auctionId ? nextLot : lot)),
    )

    return nextLot
  }, [])

  useEffect(() => {
/**
 * refreshAuctionById - Utility function
 * @returns void
 */
    void refresh()
  }, [refresh])

  return {
/**
 * response - Utility function
 * @returns void
 */
    lots,
    total,
    isLoading,
    error,
/**
 * nextLot - Utility function
 * @returns void
 */
    refresh,
    refreshAuctionById,
  }
}
