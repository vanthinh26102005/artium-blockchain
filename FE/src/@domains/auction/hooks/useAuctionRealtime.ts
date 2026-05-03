import { useEffect } from 'react'
import { io } from 'socket.io-client'

type UseAuctionRealtimeInput = {
  auctionIds: string[]
  onAuctionChange: (auctionId: string) => void
}

/**
 * resolveAuctionId - Utility function
 * @returns void
 */
const resolveAuctionId = (payload: unknown) => {
  if (payload && typeof payload === 'object' && 'auctionId' in payload) {
    const auctionId = (payload as { auctionId?: unknown }).auctionId
    return typeof auctionId === 'string' ? auctionId : null
  }
/**
 * auctionId - Utility function
 * @returns void
 */

  return null
}

export const useAuctionRealtime = ({ auctionIds, onAuctionChange }: UseAuctionRealtimeInput) => {
  useEffect(() => {
    if (auctionIds.length === 0) {
      return
    }

/**
 * useAuctionRealtime - Custom React hook
 * @returns void
 */
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8081'
    const socket = io(`${wsUrl}/auction`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const handleAuctionEvent = (payload: unknown) => {
      const auctionId = resolveAuctionId(payload)
/**
 * wsUrl - Utility function
 * @returns void
 */
      if (auctionId) {
        onAuctionChange(auctionId)
      }
    }
/**
 * socket - Utility function
 * @returns void
 */

    socket.on('connect', () => {
      auctionIds.forEach((auctionId) => {
        socket.emit('joinAuction', { auctionId })
      })
    })
    socket.on('auctionStateChanged', handleAuctionEvent)
    socket.on('auctionBidUpdated', handleAuctionEvent)
    socket.on('auctionExtended', handleAuctionEvent)
/**
 * handleAuctionEvent - Utility function
 * @returns void
 */

    return () => {
      auctionIds.forEach((auctionId) => {
        socket.emit('leaveAuction', { auctionId })
/**
 * auctionId - Utility function
 * @returns void
 */
      })
      socket.off('auctionStateChanged', handleAuctionEvent)
      socket.off('auctionBidUpdated', handleAuctionEvent)
      socket.off('auctionExtended', handleAuctionEvent)
      socket.disconnect()
    }
  }, [auctionIds, onAuctionChange])
}
