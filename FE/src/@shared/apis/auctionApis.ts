import { apiFetch, encodePathSegment, withQuery } from '@shared/services/apiClient'

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

export type SellerAuctionArtworkEligibilityReason =
  | 'NOT_ACTIVE'
  | 'NOT_PUBLISHED'
  | 'SOLD'
  | 'DELETED'
  | 'RESERVED'
  | 'IN_AUCTION'
  | 'HAS_ON_CHAIN_AUCTION'
  | 'ACTIVE_ORDER_LOCK'
  | 'MULTI_QUANTITY'
  | 'MISSING_PRIMARY_IMAGE'
  | 'MISSING_METADATA'

export type SellerAuctionArtworkRecoveryAction = {
  reasonCode: SellerAuctionArtworkEligibilityReason
  message: string
  actionLabel: string
}

export type SellerAuctionArtworkCandidate = {
  artworkId: string
  sellerId: string
  title: string
  creatorName: string
  thumbnailUrl: string | null
  status: string
  isPublished: boolean
  quantity: number
  onChainAuctionId: string | null
  isEligible: boolean
  reasonCodes: SellerAuctionArtworkEligibilityReason[]
  recoveryActions: SellerAuctionArtworkRecoveryAction[]
}

export type SellerAuctionArtworkCandidatesResponse = {
  eligible: SellerAuctionArtworkCandidate[]
  blocked: SellerAuctionArtworkCandidate[]
  total: number
  eligibleCount: number
  blockedCount: number
}

export type SellerAuctionReservePolicy = 'none' | 'set'

export type SellerAuctionStartStatus =
  | 'pending_start'
  | 'auction_active'
  | 'start_failed'
  | 'retry_available'

export type SellerAuctionStartFailureReason =
  | 'ARTWORK_NOT_ELIGIBLE'
  | 'SELLER_WALLET_MISSING'
  | 'SELLER_PROFILE_INACTIVE'
  | 'BLOCKCHAIN_CONFIG_MISSING'
  | 'WALLET_MISMATCH'
  | 'INVALID_TRANSACTION_HASH'
  | 'ATTEMPT_NOT_FOUND'

export type SellerAuctionStartTermsSnapshot = {
  reservePolicy: SellerAuctionReservePolicy
  reservePriceEth?: string | null
  minBidIncrementEth: string
  durationHours: number
  shippingDisclosure: string
  paymentDisclosure: string
  economicsLockedAcknowledged: boolean
}

export type SellerAuctionStartTransactionRequest = {
  contractAddress: string
  data: string
}

export type SellerAuctionStartStatusResponse = {
  attemptId: string
  sellerId: string
  artworkId: string
  orderId: string
  status: SellerAuctionStartStatus
  artworkTitle: string
  creatorName?: string | null
  thumbnailUrl?: string | null
  contractAddress?: string | null
  txHash?: string | null
  walletAddress?: string | null
  reasonCode?: SellerAuctionStartFailureReason | null
  reasonMessage?: string | null
  retryAllowed: boolean
  editAllowed: boolean
  walletActionRequired: boolean
  transactionRequest?: SellerAuctionStartTransactionRequest | null
  submittedTermsSnapshot: SellerAuctionStartTermsSnapshot
  activatedAt?: string | null
  updatedAt: string
}

export type StartSellerAuctionRequest = {
  artworkId: string
  reservePolicy: SellerAuctionReservePolicy
  reservePriceEth?: string | null
  minBidIncrementEth: string
  durationHours: number
  shippingDisclosure: string
  paymentDisclosure: string
  economicsLockedAcknowledged: boolean
}

export type AttachSellerAuctionStartTxRequest = {
  walletAddress: string
  txHash: string
}

export type GetAuctionsInput = {
  status?: AuctionStatusKey
  category?: AuctionCategoryKey
  minBidEth?: number
  maxBidEth?: number
  skip?: number
  take?: number
}

const auctionApis = {
  getAuctions: async (input: GetAuctionsInput = {}): Promise<PaginatedAuctionsResponse> => {
    return apiFetch<PaginatedAuctionsResponse>(withQuery('/auctions', input), { auth: false })
  },

  getAuctionById: async (auctionId: string): Promise<AuctionReadResponse> => {
    return apiFetch<AuctionReadResponse>(`/auctions/${encodePathSegment(auctionId)}`, {
      auth: false,
    })
  },

  getSellerArtworkCandidates: async (): Promise<SellerAuctionArtworkCandidatesResponse> => {
    return apiFetch<SellerAuctionArtworkCandidatesResponse>('/auctions/seller/artwork-candidates', {
      cache: 'no-store',
    })
  },

  startSellerAuction: async (
    input: StartSellerAuctionRequest,
  ): Promise<SellerAuctionStartStatusResponse> => {
    return apiFetch<SellerAuctionStartStatusResponse>('/auctions/seller/start-attempts', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  attachSellerAuctionStartTx: async (
    attemptId: string,
    input: AttachSellerAuctionStartTxRequest,
  ): Promise<SellerAuctionStartStatusResponse> => {
    return apiFetch<SellerAuctionStartStatusResponse>(
      `/auctions/seller/start-attempts/${encodePathSegment(attemptId)}/tx`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    )
  },

  retrySellerAuctionStart: async (
    input: StartSellerAuctionRequest,
  ): Promise<SellerAuctionStartStatusResponse> => {
    return auctionApis.startSellerAuction(input)
  },

  getSellerAuctionStartStatus: async (
    artworkId: string,
  ): Promise<SellerAuctionStartStatusResponse | null> => {
    return apiFetch<SellerAuctionStartStatusResponse | null>(
      `/auctions/seller/start-status/${encodePathSegment(artworkId)}`,
      { cache: 'no-store' },
    )
  },
}

export default auctionApis
