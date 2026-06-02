import type { AuctionBidLot } from '../components'

export type StoredAuctionBid = {
  auctionId: string
  artworkId: string
  title: string
  imageSrc: string
  imageAlt: string
  bidAmountEth: number
  transactionHash: string
  walletAddress: string
  contractAddress?: string | null
  status: 'pending' | 'confirmed'
  createdAt: string
  updatedAt: string
}

const STORAGE_PREFIX = 'artium.auction.bid.'
const HISTORY_STORAGE_KEY = 'artium.auction.bid.history'
const MAX_HISTORY_RECORDS = 100

const getStorageKey = (auctionId: string) => `${STORAGE_PREFIX}${auctionId}`

const isBrowser = () => typeof window !== 'undefined'

const isStoredAuctionBid = (value: unknown): value is StoredAuctionBid => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredAuctionBid>

  return (
    typeof candidate.auctionId === 'string' &&
    typeof candidate.artworkId === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.imageSrc === 'string' &&
    typeof candidate.imageAlt === 'string' &&
    typeof candidate.bidAmountEth === 'number' &&
    typeof candidate.transactionHash === 'string' &&
    typeof candidate.walletAddress === 'string' &&
    (candidate.status === 'pending' || candidate.status === 'confirmed') &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

export const getStoredAuctionBid = (auctionId: string): StoredAuctionBid | null => {
  if (!isBrowser()) {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(auctionId))
    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as unknown
    return isStoredAuctionBid(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

const readLegacyStoredBids = () => {
  if (!isBrowser()) {
    return []
  }

  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX) && key !== HISTORY_STORAGE_KEY)
    .map((key) => {
      try {
        const parsedValue = JSON.parse(window.localStorage.getItem(key) ?? 'null') as unknown
        return isStoredAuctionBid(parsedValue) ? parsedValue : null
      } catch {
        return null
      }
    })
    .filter((bid): bid is StoredAuctionBid => Boolean(bid))
}

export const getStoredAuctionBidHistory = (): StoredAuctionBid[] => {
  if (!isBrowser()) {
    return []
  }

  try {
    const parsedValue = JSON.parse(
      window.localStorage.getItem(HISTORY_STORAGE_KEY) ?? '[]',
    ) as unknown
    const storedHistory = Array.isArray(parsedValue)
      ? parsedValue.filter(isStoredAuctionBid)
      : []
    const legacyBids = readLegacyStoredBids()
    const merged = new Map<string, StoredAuctionBid>()

    ;[...legacyBids, ...storedHistory].forEach((bid) => {
      const key = bid.transactionHash || `${bid.auctionId}:${bid.updatedAt}`
      const existing = merged.get(key)
      if (!existing || new Date(bid.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        merged.set(key, bid)
      }
    })

    return Array.from(merged.values()).sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
  } catch {
    return readLegacyStoredBids().sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
  }
}

export const saveStoredAuctionBid = (input: {
  lot: AuctionBidLot
  committedBidValue: number
  transactionHash: string
  walletAddress: string
  status: StoredAuctionBid['status']
}) => {
  if (!isBrowser()) {
    return null
  }

  const auctionId = input.lot.onChainOrderId ?? input.lot.auctionId ?? input.lot.artworkId
  const now = new Date().toISOString()
  const previous = getStoredAuctionBid(auctionId)
  const nextValue: StoredAuctionBid = {
    auctionId,
    artworkId: input.lot.artworkId,
    title: input.lot.title,
    imageSrc: input.lot.imageSrc,
    imageAlt: input.lot.imageAlt,
    bidAmountEth: input.committedBidValue,
    transactionHash: input.transactionHash,
    walletAddress: input.walletAddress,
    contractAddress: input.lot.contractAddress ?? null,
    status: input.status,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }

  try {
    window.localStorage.setItem(getStorageKey(auctionId), JSON.stringify(nextValue))
    const nextHistory = [
      nextValue,
      ...getStoredAuctionBidHistory().filter((bid) => bid.transactionHash !== nextValue.transactionHash),
    ]
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .slice(0, MAX_HISTORY_RECORDS)

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory))
    return nextValue
  } catch {
    return null
  }
}
