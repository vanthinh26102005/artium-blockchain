import type { AuctionLot, AuctionRead } from '../types'

/**
 * liveStatusKeys - Utility function
 * @returns void
 */
const liveStatusKeys = new Set(['active', 'ending-soon'])

export const mapAuctionReadToLot = (auction: AuctionRead): AuctionLot => {
  const title = auction.artwork.title || `Auction ${auction.auctionId}`
  const imageAlt =
    /**
     * mapAuctionReadToLot - Utility function
     * @returns void
     */
    auction.artwork.imageAlt ||
    (auction.artwork.imageSrc
      ? `Artwork preview of ${title}`
      : `Auction lot ${auction.onChainOrderId}`)
  /**
   * title - Utility function
   * @returns void
   */

  return {
    auctionId: auction.auctionId,
    onChainOrderId: auction.onChainOrderId,
    /**
     * imageAlt - Utility function
     * @returns void
     */
    artworkId: auction.artwork.artworkId,
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
    serverTime: auction.serverTime,
  }
}
