import { useEffect, useMemo, useRef } from 'react'
import { io } from 'socket.io-client'

type UseAuctionRealtimeInput = {
  auctionIds: string[]
  onAuctionChange: (auctionId: string) => void
}

const AUCTION_EVENT_THROTTLE_MS = 500

const resolveAuctionId = (payload: unknown) => {
  if (payload && typeof payload === 'object' && 'auctionId' in payload) {
    const auctionId = (payload as { auctionId?: unknown }).auctionId
    return typeof auctionId === 'string' ? auctionId : null
  }

  return null
}

export const useAuctionRealtime = ({ auctionIds, onAuctionChange }: UseAuctionRealtimeInput) => {
  const onAuctionChangeRef = useRef(onAuctionChange)
  const auctionIdsKey = useMemo(
    () =>
      Array.from(new Set(auctionIds.filter((auctionId): auctionId is string => Boolean(auctionId))))
        .sort()
        .join('|'),
    [auctionIds],
  )

  useEffect(() => {
    onAuctionChangeRef.current = onAuctionChange
  }, [onAuctionChange])

  useEffect(() => {
    const normalizedAuctionIds = auctionIdsKey ? auctionIdsKey.split('|') : []

    if (normalizedAuctionIds.length === 0) {
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8081'
    const socket = io(`${wsUrl}/auction`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    const pendingAuctionEvents = new Map<string, number>()

    const handleAuctionEvent = (payload: unknown) => {
      const auctionId = resolveAuctionId(payload)
      if (!auctionId || !normalizedAuctionIds.includes(auctionId)) {
        return
      }

      if (pendingAuctionEvents.has(auctionId)) {
        return
      }

      const timeoutId = window.setTimeout(() => {
        pendingAuctionEvents.delete(auctionId)
        onAuctionChangeRef.current(auctionId)
      }, AUCTION_EVENT_THROTTLE_MS)

      pendingAuctionEvents.set(auctionId, timeoutId)
    }

    socket.on('connect', () => {
      normalizedAuctionIds.forEach((auctionId) => {
        socket.emit('joinAuction', { auctionId })
      })
    })
    socket.on('auctionStateChanged', handleAuctionEvent)
    socket.on('auctionBidUpdated', handleAuctionEvent)
    socket.on('auctionExtended', handleAuctionEvent)

    return () => {
      pendingAuctionEvents.forEach((timeoutId) => window.clearTimeout(timeoutId))
      pendingAuctionEvents.clear()
      normalizedAuctionIds.forEach((auctionId) => {
        socket.emit('leaveAuction', { auctionId })
      })
      socket.off('auctionStateChanged', handleAuctionEvent)
      socket.off('auctionBidUpdated', handleAuctionEvent)
      socket.off('auctionExtended', handleAuctionEvent)
      socket.disconnect()
    }
  }, [auctionIdsKey])
}
