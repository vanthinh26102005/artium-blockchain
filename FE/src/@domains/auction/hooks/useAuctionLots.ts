import { useCallback, useEffect, useRef, useState } from 'react'
import auctionApis, { type GetAuctionsInput } from '@shared/apis/auctionApis'
import { mapAuctionReadToLot } from '../mappers/auctionLotMapper'
import type { AuctionLot } from '../types'
import {
  applyAuctionRealtimeEventToLot,
  type AuctionRealtimeEvent,
} from '../utils/auctionRealtime'

type UseAuctionLotsResult = {
  lots: AuctionLot[]
  total: number
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  refreshAuctionById: (auctionId: string) => Promise<AuctionLot>
  applyRealtimeEvent: (event: AuctionRealtimeEvent) => boolean
}

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error('Unable to sync auction state.')

const isSameLot = (currentLot: AuctionLot, nextLot: AuctionLot) =>
  currentLot.auctionId === nextLot.auctionId ||
  currentLot.onChainOrderId === nextLot.onChainOrderId ||
  currentLot.artworkId === nextLot.artworkId

export const useAuctionLots = (input: GetAuctionsInput): UseAuctionLotsResult => {
  const { category, maxBidEth, minBidEth, skip, status, take } = input
  const [lots, setLots] = useState<AuctionLot[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const lotsRef = useRef<AuctionLot[]>([])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await auctionApis.getAuctions({
        category,
        maxBidEth,
        minBidEth,
        skip,
        status,
        take,
      })
      const nextLots = response.data.map(mapAuctionReadToLot)
      lotsRef.current = nextLots
      setLots(nextLots)
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

    setLots((currentLots) => {
      const nextLots = currentLots.map((lot) => (isSameLot(lot, nextLot) ? nextLot : lot))
      lotsRef.current = nextLots
      return nextLots
    })

    return nextLot
  }, [])

  const applyRealtimeEvent = useCallback((event: AuctionRealtimeEvent) => {
    let didApply = false

    const nextLots = lotsRef.current.map((lot) => {
      const nextLot = applyAuctionRealtimeEventToLot(lot, event)
      if (!nextLot) {
        return lot
      }

      didApply = true
      return nextLot
    })

    if (didApply) {
      lotsRef.current = nextLots
      setLots(nextLots)
    }

    return didApply
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    lots,
    total,
    isLoading,
    error,
    refresh,
    refreshAuctionById,
    applyRealtimeEvent,
  }
}
