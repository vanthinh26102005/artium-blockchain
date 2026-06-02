import type { AuctionLot, AuctionLotStatusKey } from '../types'

export type AuctionRealtimeEventType =
  | 'state_changed'
  | 'bid_updated'
  | 'extended'
  | 'ended'
  | 'cancelled'

export type AuctionRealtimePatch = Partial<{
  currentBidWei: string
  currentBidEth: number
  minimumNextBidWei: string
  minimumNextBidEth: number
  minBidIncrementWei: string
  highestBidder: string | null
  statusKey: AuctionLotStatusKey
  statusLabel: string
  endsAt: string
  serverTime: string
  txHash: string | null
  orderStatus: string | null
  paymentStatus: string | null
  escrowState: number | null
}>

export type AuctionRealtimeEvent = {
  auctionId: string
  eventType: AuctionRealtimeEventType
  version?: number
  emittedAt?: string
  patch?: AuctionRealtimePatch
}

const auctionRealtimeEventTypes = new Set<AuctionRealtimeEventType>([
  'state_changed',
  'bid_updated',
  'extended',
  'ended',
  'cancelled',
])
const auctionLotStatusKeys = new Set<AuctionLotStatusKey>([
  'active',
  'ending-soon',
  'newly-listed',
  'paused',
  'closed',
])
const liveStatusKeys = new Set<AuctionLotStatusKey>(['active', 'ending-soon'])

const isSameAuctionIdentifier = (lot: AuctionLot, auctionId: string) =>
  lot.auctionId === auctionId || lot.onChainOrderId === auctionId || lot.artworkId === auctionId

const hasOwn = <T extends object, K extends PropertyKey>(
  target: T,
  key: K,
): target is T & Record<K, unknown> => Object.prototype.hasOwnProperty.call(target, key)

const pickPatchValue = <T>(
  patch: AuctionRealtimePatch,
  key: keyof AuctionRealtimePatch,
  currentValue: T,
) => (hasOwn(patch, key) ? (patch[key] as T) : currentValue)

const resolveAuctionId = (payload: Record<string, unknown>) => {
  const auctionId = payload.auctionId
  return typeof auctionId === 'string' ? auctionId : null
}

const resolveEventType = (
  payload: Record<string, unknown>,
  fallbackEventType: AuctionRealtimeEventType,
) => {
  const eventType = payload.eventType
  return typeof eventType === 'string' && auctionRealtimeEventTypes.has(eventType as AuctionRealtimeEventType)
    ? (eventType as AuctionRealtimeEventType)
    : fallbackEventType
}

const resolveVersion = (payload: Record<string, unknown>) => {
  const version = payload.version
  return typeof version === 'number' && Number.isFinite(version) ? version : undefined
}

const assignStringPatchValue = (
  patch: AuctionRealtimePatch,
  source: Record<string, unknown>,
  key: keyof AuctionRealtimePatch,
) => {
  const value = source[key]
  if (typeof value === 'string') {
    const patchRecord = patch as Record<string, unknown>
    patchRecord[key] = value
  }
}

const assignNullableStringPatchValue = (
  patch: AuctionRealtimePatch,
  source: Record<string, unknown>,
  key: keyof AuctionRealtimePatch,
) => {
  const value = source[key]
  if (typeof value === 'string' || value === null) {
    const patchRecord = patch as Record<string, unknown>
    patchRecord[key] = value
  }
}

const assignNumberPatchValue = (
  patch: AuctionRealtimePatch,
  source: Record<string, unknown>,
  key: keyof AuctionRealtimePatch,
) => {
  const value = source[key]
  if (typeof value === 'number' && Number.isFinite(value)) {
    const patchRecord = patch as Record<string, unknown>
    patchRecord[key] = value
  }
}

const resolvePatch = (payload: Record<string, unknown>): AuctionRealtimePatch | undefined => {
  const rawPatch = payload.patch
  const patchSource =
    rawPatch && typeof rawPatch === 'object' && !Array.isArray(rawPatch)
      ? (rawPatch as Record<string, unknown>)
      : payload
  const patch: AuctionRealtimePatch = {}

  assignStringPatchValue(patch, patchSource, 'currentBidWei')
  assignStringPatchValue(patch, patchSource, 'minimumNextBidWei')
  assignStringPatchValue(patch, patchSource, 'minBidIncrementWei')
  assignStringPatchValue(patch, patchSource, 'statusLabel')
  assignStringPatchValue(patch, patchSource, 'endsAt')
  assignStringPatchValue(patch, patchSource, 'serverTime')
  assignNullableStringPatchValue(patch, patchSource, 'highestBidder')
  assignNullableStringPatchValue(patch, patchSource, 'txHash')
  assignNullableStringPatchValue(patch, patchSource, 'orderStatus')
  assignNullableStringPatchValue(patch, patchSource, 'paymentStatus')
  assignNumberPatchValue(patch, patchSource, 'currentBidEth')
  assignNumberPatchValue(patch, patchSource, 'minimumNextBidEth')
  assignNumberPatchValue(patch, patchSource, 'escrowState')

  const statusKey = patchSource.statusKey
  if (typeof statusKey === 'string' && auctionLotStatusKeys.has(statusKey as AuctionLotStatusKey)) {
    patch.statusKey = statusKey as AuctionLotStatusKey
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

export const normalizeAuctionRealtimeEvent = (
  payload: unknown,
  fallbackEventType: AuctionRealtimeEventType,
): AuctionRealtimeEvent | null => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }

  const source = payload as Record<string, unknown>
  const auctionId = resolveAuctionId(source)
  if (!auctionId) {
    return null
  }

  const emittedAt = source.emittedAt

  return {
    auctionId,
    eventType: resolveEventType(source, fallbackEventType),
    version: resolveVersion(source),
    emittedAt: typeof emittedAt === 'string' ? emittedAt : undefined,
    patch: resolvePatch(source),
  }
}

export const applyAuctionRealtimeEventToLot = (
  lot: AuctionLot,
  event: AuctionRealtimeEvent,
): AuctionLot | null => {
  if (!isSameAuctionIdentifier(lot, event.auctionId) || !event.patch) {
    return null
  }

  const statusKey = pickPatchValue(event.patch, 'statusKey', lot.statusKey)

  return {
    ...lot,
    bidValue: pickPatchValue(event.patch, 'currentBidEth', lot.bidValue),
    currentBidWei: pickPatchValue(event.patch, 'currentBidWei', lot.currentBidWei),
    minimumNextBidWei: pickPatchValue(
      event.patch,
      'minimumNextBidWei',
      lot.minimumNextBidWei,
    ),
    minimumNextBidEth: pickPatchValue(
      event.patch,
      'minimumNextBidEth',
      lot.minimumNextBidEth,
    ),
    minBidIncrementWei: pickPatchValue(
      event.patch,
      'minBidIncrementWei',
      lot.minBidIncrementWei,
    ),
    highestBidder: pickPatchValue(event.patch, 'highestBidder', lot.highestBidder ?? null),
    status: pickPatchValue(event.patch, 'statusLabel', lot.status),
    statusKey,
    statusTone: liveStatusKeys.has(statusKey) ? 'live' : 'muted',
    endsAt: pickPatchValue(event.patch, 'endsAt', lot.endsAt),
    serverTime: pickPatchValue(event.patch, 'serverTime', lot.serverTime),
    txHash: pickPatchValue(event.patch, 'txHash', lot.txHash ?? null),
    orderStatus: pickPatchValue(event.patch, 'orderStatus', lot.orderStatus ?? null),
    paymentStatus: pickPatchValue(event.patch, 'paymentStatus', lot.paymentStatus ?? null),
    escrowState: pickPatchValue(event.patch, 'escrowState', lot.escrowState ?? null),
  }
}
