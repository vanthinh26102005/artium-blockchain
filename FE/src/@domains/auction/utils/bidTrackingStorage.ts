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
    return nextValue
  } catch {
    return null
  }
}
