import { apiFetch } from '@shared/services/apiClient'

export type AuctionStatusKey = 'active' | 'ending-soon' | 'newly-listed' | 'paused' | 'closed'

export type AuctionCategoryKey = 'architectural' | 'sculpture' | 'digital' | 'installation'

export type AuctionArtworkDisplayResponse = {
  artworkId: string
  title: string
  creatorName: string
  imageSrc: string
  imageAlt: string
  categoryKey: AuctionCategoryKey
}

export type AuctionReadResponse = {
  auctionId: string
  onChainOrderId: string
  contractAddress?: string | null
  statusKey: AuctionStatusKey
  statusLabel: string
  currentBidWei: string
  currentBidEth: number
  minimumNextBidWei: string
  minimumNextBidEth: number
  minBidIncrementWei: string
  endsAt: string
  serverTime: string
  highestBidder?: string | null
  sellerWallet?: string | null
  txHash?: string | null
  artwork: AuctionArtworkDisplayResponse
}

export type PaginatedAuctionsResponse = {
  data: AuctionReadResponse[]
  total: number
}

export type GetAuctionsInput = {
  status?: AuctionStatusKey
  category?: AuctionCategoryKey
  minBidEth?: number
  maxBidEth?: number
  skip?: number
  take?: number
}

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString.length > 0 ? `?${queryString}` : ''
}

const auctionApis = {
  getAuctions: async (input: GetAuctionsInput = {}): Promise<PaginatedAuctionsResponse> => {
    const query = buildQueryString(input)
    return apiFetch<PaginatedAuctionsResponse>(`/auctions${query}`, { auth: false })
  },

  getAuctionById: async (auctionId: string): Promise<AuctionReadResponse> => {
    return apiFetch<AuctionReadResponse>(`/auctions/${encodeURIComponent(auctionId)}`, {
      auth: false,
    })
  },
}

export default auctionApis
