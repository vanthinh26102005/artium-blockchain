import type {
  AuctionCategoryKey,
  AuctionReadResponse,
  AuctionStatusKey,
  PaginatedAuctionsResponse,
} from '@shared/apis/auctionApis'
import type { AuctionBidLot } from './components'

export type {
  AuctionCategoryKey,
  AuctionReadResponse as AuctionRead,
  AuctionStatusKey,
  PaginatedAuctionsResponse,
}

export type AuctionFilterCategoryKey = 'all' | AuctionCategoryKey

export type AuctionFilterStatusKey = 'all' | AuctionStatusKey

export type AuctionLotStatusKey = AuctionStatusKey

export type AuctionLot = AuctionBidLot & {
  auctionId: string
  onChainOrderId: string
  categoryKey: AuctionCategoryKey
  statusTone: 'live' | 'muted'
  currentBidWei: string
  minimumNextBidWei: string
  minimumNextBidEth: number
  minBidIncrementWei: string
  highestBidder?: string | null
  sellerWallet?: string | null
  contractAddress?: string | null
  txHash?: string | null
  serverTime: string
}
