import { useEffect, useMemo, useRef } from 'react'
import { io } from 'socket.io-client'
import {
  normalizeAuctionRealtimeEvent,
  type AuctionRealtimeEvent,
  type AuctionRealtimeEventType,
} from '../utils/auctionRealtime'

type UseAuctionRealtimeInput = {
  auctionIds: string[]
  onAuctionChange: (auctionId: string, reason: AuctionRealtimeSyncReason) => void
  onAuctionPatch?: (event: AuctionRealtimeEvent) => boolean
}

const AUCTION_EVENT_THROTTLE_MS = 500

export type AuctionRealtimeSyncReason =
  | 'missing_patch'
  | 'version_gap'
  | 'patch_rejected'
  | 'reconnect'

export const useAuctionRealtime = ({
  auctionIds,
  onAuctionChange,
  onAuctionPatch,
}: UseAuctionRealtimeInput) => {
  const onAuctionChangeRef = useRef(onAuctionChange)
  const onAuctionPatchRef = useRef(onAuctionPatch)
  const lastVersionByAuctionIdRef = useRef(new Map<string, number>())
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
    onAuctionPatchRef.current = onAuctionPatch
  }, [onAuctionPatch])

  useEffect(() => {
    const normalizedAuctionIds = auctionIdsKey ? auctionIdsKey.split('|') : []

    if (normalizedAuctionIds.length === 0) {
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8081'
    let hasConnected = false
    const socket = io(`${wsUrl}/auction`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    const pendingAuctionEvents = new Map<string, number>()

    const scheduleAuctionSync = (auctionId: string, reason: AuctionRealtimeSyncReason) => {
      if (!auctionId || !normalizedAuctionIds.includes(auctionId)) {
        return
      }

      if (pendingAuctionEvents.has(auctionId)) {
        return
      }

      const timeoutId = window.setTimeout(() => {
        pendingAuctionEvents.delete(auctionId)
        onAuctionChangeRef.current(auctionId, reason)
      }, AUCTION_EVENT_THROTTLE_MS)

      pendingAuctionEvents.set(auctionId, timeoutId)
    }

    const handleAuctionEvent =
      (fallbackEventType: AuctionRealtimeEventType) => (payload: unknown) => {
        const event = normalizeAuctionRealtimeEvent(payload, fallbackEventType)
        if (!event || !normalizedAuctionIds.includes(event.auctionId)) {
          return
        }

        const lastVersion = lastVersionByAuctionIdRef.current.get(event.auctionId)
        if (event.version !== undefined) {
          if (lastVersion !== undefined && event.version <= lastVersion) {
            return
          }

          if (lastVersion !== undefined && event.version > lastVersion + 1) {
            lastVersionByAuctionIdRef.current.set(event.auctionId, event.version)
            scheduleAuctionSync(event.auctionId, 'version_gap')
            return
          }

          lastVersionByAuctionIdRef.current.set(event.auctionId, event.version)
        }

        if (!event.patch) {
          scheduleAuctionSync(event.auctionId, 'missing_patch')
          return
        }

        const didApplyPatch = onAuctionPatchRef.current?.(event) ?? false
        if (!didApplyPatch) {
          scheduleAuctionSync(event.auctionId, 'patch_rejected')
        }
      }

    const handleConnect = () => {
      normalizedAuctionIds.forEach((auctionId) => {
        socket.emit('joinAuction', { auctionId })
      })

      if (hasConnected) {
        normalizedAuctionIds.forEach((auctionId) => scheduleAuctionSync(auctionId, 'reconnect'))
      }
      hasConnected = true
    }
    const handleAuctionStateChanged = handleAuctionEvent('state_changed')
    const handleAuctionBidUpdated = handleAuctionEvent('bid_updated')
    const handleAuctionExtended = handleAuctionEvent('extended')
    const handleAuctionEnded = handleAuctionEvent('ended')
    const handleAuctionCancelled = handleAuctionEvent('cancelled')

    socket.on('connect', handleConnect)
    socket.on('auctionStateChanged', handleAuctionStateChanged)
    socket.on('auctionBidUpdated', handleAuctionBidUpdated)
    socket.on('auctionExtended', handleAuctionExtended)
    socket.on('auctionEnded', handleAuctionEnded)
    socket.on('auctionCancelled', handleAuctionCancelled)

    return () => {
      pendingAuctionEvents.forEach((timeoutId) => window.clearTimeout(timeoutId))
      pendingAuctionEvents.clear()
      normalizedAuctionIds.forEach((auctionId) => {
        socket.emit('leaveAuction', { auctionId })
      })
      socket.off('connect', handleConnect)
      socket.off('auctionStateChanged', handleAuctionStateChanged)
      socket.off('auctionBidUpdated', handleAuctionBidUpdated)
      socket.off('auctionExtended', handleAuctionExtended)
      socket.off('auctionEnded', handleAuctionEnded)
      socket.off('auctionCancelled', handleAuctionCancelled)
      socket.disconnect()
    }
  }, [auctionIdsKey])
}
