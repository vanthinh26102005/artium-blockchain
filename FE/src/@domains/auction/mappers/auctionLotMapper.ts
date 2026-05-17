import type { AuctionLot, AuctionRead } from '../types'

const liveStatusKeys = new Set(['active', 'ending-soon'])

export const mapAuctionReadToLot = (auction: AuctionRead): AuctionLot => {
  const title = auction.artwork.title || `Auction ${auction.auctionId}`
  const imageAlt =
    auction.artwork.imageAlt ||
    (auction.artwork.imageSrc
      ? `Artwork preview of ${title}`
      : `Auction lot ${auction.onChainOrderId}`)

  return {
    auctionId: auction.auctionId,
    onChainOrderId: auction.onChainOrderId,
    artworkId: auction.artwork.artworkId,
    sellerId: auction.artwork.sellerId ?? null,
    title,
    bidValue: auction.currentBidEth,
    categoryKey: auction.artwork.categoryKey,
    status: auction.statusLabel,
    statusKey: auction.statusKey,
    statusTone: liveStatusKeys.has(auction.statusKey) ? 'live' : 'muted',
    endsAt: auction.endsAt,
    imageSrc: auction.artwork.imageSrc,
    imageAlt,
    currentBidWei: auction.currentBidWei,
    minimumNextBidWei: auction.minimumNextBidWei,
    minimumNextBidEth: auction.minimumNextBidEth,
    minBidIncrementWei: auction.minBidIncrementWei,
    highestBidder: auction.highestBidder ?? null,
    sellerWallet: auction.sellerWallet ?? null,
    contractAddress: auction.contractAddress ?? null,
    txHash: auction.txHash ?? null,
    orderProjectionId: auction.orderProjectionId ?? null,
    orderNumber: auction.orderNumber ?? null,
    orderStatus: auction.orderStatus ?? null,
    paymentStatus: auction.paymentStatus ?? null,
    escrowState: auction.escrowState ?? null,
    serverTime: auction.serverTime,
  }
}
