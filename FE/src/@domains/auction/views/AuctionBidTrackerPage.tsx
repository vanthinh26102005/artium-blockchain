'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Space_Grotesk } from 'next/font/google'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowLeft, ExternalLink, RefreshCw, ShieldCheck, Wallet } from 'lucide-react'
import auctionApis from '@shared/apis/auctionApis'
import { Skeleton } from '@shared/components/ui/skeleton'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import { BidEditingModal, type BidOrderStatusPayload } from '../components'
import { useAuctionRealtime } from '../hooks/useAuctionRealtime'
import { mapAuctionReadToLot } from '../mappers/auctionLotMapper'
import type { AuctionLot } from '../types'
import {
  getStoredAuctionBid,
  saveStoredAuctionBid,
  type StoredAuctionBid,
} from '../utils/bidTrackingStorage'

type AuctionBidTrackerPageProps = {
  auctionId: string
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const formatEth = (value: number) => `${value.toFixed(2)} ETH`

const shortenHash = (value?: string | null, leading = 8, trailing = 5) => {
  if (!value) {
    return 'N/A'
  }

  if (value.length <= leading + trailing + 3) {
    return value
  }

  return `${value.slice(0, leading)}...${value.slice(-trailing)}`
}

const getTransactionUrl = (transactionHash?: string | null) => {
  if (!transactionHash) {
    return null
  }

  return `${WALLET_TARGET_CHAIN.blockExplorerUrl.replace(/\/$/, '')}/tx/${encodeURIComponent(
    transactionHash,
  )}`
}

const normalizeAddress = (value?: string | null) => value?.trim().toLowerCase() ?? null

const canPlaceBid = (lot: AuctionLot | null) =>
  lot?.statusKey === 'active' || lot?.statusKey === 'ending-soon' || lot?.statusKey === 'newly-listed'

const TrackerSkeleton = () => (
  <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
    <Skeleton className="aspect-[4/5] rounded-none bg-[#eeeeee]" />
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4 rounded-none bg-[#eeeeee]" />
      <Skeleton className="h-24 w-full rounded-none bg-[#eeeeee]" />
      <Skeleton className="h-24 w-full rounded-none bg-[#eeeeee]" />
      <Skeleton className="h-14 w-full rounded-none bg-[#eeeeee]" />
    </div>
  </div>
)

export const AuctionBidTrackerPage = ({ auctionId }: AuctionBidTrackerPageProps) => {
  const [lot, setLot] = useState<AuctionLot | null>(null)
  const [storedBid, setStoredBid] = useState<StoredAuctionBid | null>(() =>
    getStoredAuctionBid(auctionId),
  )
  const [selectedBidLot, setSelectedBidLot] = useState<AuctionLot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshAuction = useCallback(async () => {
    setError(null)
    const response = await auctionApis.getAuctionById(auctionId)
    const nextLot = mapAuctionReadToLot(response)
    setLot(nextLot)
    return nextLot
  }, [auctionId])

  useEffect(() => {
    let cancelled = false

    auctionApis
      .getAuctionById(auctionId)
      .then(mapAuctionReadToLot)
      .then((nextLot) => {
        if (!cancelled) {
          setLot(nextLot)
          setStoredBid(getStoredAuctionBid(auctionId))
        }
      })
      .then(() => {
        if (!cancelled) {
          setError(null)
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load bid tracker.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [auctionId])

  const realtimeAuctionId = lot?.auctionId ?? auctionId
  const realtimeAuctionIds = useMemo(
    () => [realtimeAuctionId],
    [realtimeAuctionId],
  )
  const handleRealtimeAuctionChange = useCallback(() => {
    void refreshAuction()
  }, [refreshAuction])

  useAuctionRealtime({
    auctionIds: realtimeAuctionIds,
    onAuctionChange: handleRealtimeAuctionChange,
  })

  const isLeadingBidder = useMemo(
    () => normalizeAddress(lot?.highestBidder) === normalizeAddress(storedBid?.walletAddress),
    [lot?.highestBidder, storedBid?.walletAddress],
  )
  const effectiveStoredBid = useMemo<StoredAuctionBid | null>(() => {
    if (!storedBid) {
      return null
    }

    if (isLeadingBidder && storedBid.status !== 'confirmed') {
      return {
        ...storedBid,
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
      }
    }

    return storedBid
  }, [isLeadingBidder, storedBid])
  const bidStatusLabel = effectiveStoredBid
    ? effectiveStoredBid.status === 'confirmed' || isLeadingBidder
      ? 'Leading Bid'
      : 'Pending Sync'
    : 'No Local Bid'
  const txHref = getTransactionUrl(effectiveStoredBid?.transactionHash)

  useEffect(() => {
    if (!lot || !storedBid || !effectiveStoredBid || storedBid.status === effectiveStoredBid.status) {
      return
    }

    saveStoredAuctionBid({
      lot,
      committedBidValue: effectiveStoredBid.bidAmountEth,
      transactionHash: effectiveStoredBid.transactionHash,
      walletAddress: effectiveStoredBid.walletAddress,
      status: effectiveStoredBid.status,
    })
  }, [effectiveStoredBid, lot, storedBid])

  const handleRefreshLot = useCallback(
    async (nextAuctionId: string) => {
      const nextLot = await auctionApis.getAuctionById(nextAuctionId).then(mapAuctionReadToLot)
      setLot(nextLot)
      setSelectedBidLot((currentLot) => (currentLot ? nextLot : currentLot))
      setStoredBid(getStoredAuctionBid(nextLot.onChainOrderId))
      return nextLot
    },
    [],
  )

  const handleTrackBid = ({ lot: nextLot }: BidOrderStatusPayload) => {
    if (nextLot.onChainOrderId) {
      setStoredBid(getStoredAuctionBid(nextLot.onChainOrderId))
    }
    setSelectedBidLot(null)
    void refreshAuction()
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12 text-[#1a1c1c] md:px-12 md:py-16">
      <main className="mx-auto max-w-[1440px]">
        <header className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <Link
              href="/auction"
              className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-black/55 uppercase transition hover:text-black"
              style={headlineFont}
            >
              <ArrowLeft className="h-4 w-4" />
              Live Auctions
            </Link>
            <p className="text-[11px] tracking-[0.25em] text-[#747777] uppercase" style={headlineFont}>
              Bid Tracker
            </p>
            <h1 className="mt-3 text-5xl leading-none font-bold tracking-[0.02em] text-black uppercase md:text-7xl" style={headlineFont}>
              {lot?.title ?? 'Auction Bid'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              void refreshAuction()
            }}
            className="inline-flex min-h-12 w-fit items-center justify-center gap-2 border border-black px-5 text-[11px] font-bold tracking-[0.18em] text-black uppercase transition hover:bg-black hover:text-white"
            style={headlineFont}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        {isLoading ? (
          <TrackerSkeleton />
        ) : error || !lot ? (
          <section className="border border-[#dc2626]/30 bg-[#fff7f7] px-6 py-8">
            <p className="text-sm leading-7 text-[#7f1d1d]">
              {error ?? 'Unable to load this auction bid tracker.'}
            </p>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="relative aspect-[4/5] overflow-hidden bg-[#f3f3f3]">
              {lot.imageSrc ? (
                <Image
                  src={lot.imageSrc}
                  alt={lot.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover grayscale-[0.08]"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center text-[11px] tracking-[0.2em] text-[#747777] uppercase">
                  Image Syncing
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-white/92 px-6 py-6 backdrop-blur-md md:px-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-black/45 uppercase" style={headlineFont}>
                      On-Chain Auction
                    </p>
                    <p className="mt-2 font-mono text-sm text-black/72">{lot.onChainOrderId}</p>
                  </div>
                  <Link
                    href={`/artworks/${lot.artworkId}`}
                    className="text-[11px] font-bold tracking-[0.18em] text-black uppercase transition hover:text-black/60"
                    style={headlineFont}
                  >
                    View Artwork
                  </Link>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="border border-black/10 bg-[#f7f7f7] p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-[11px] tracking-[0.2em] text-black/45 uppercase" style={headlineFont}>
                    Live State
                  </p>
                  <span className="bg-black px-3 py-1 text-[10px] tracking-[0.16em] text-white uppercase">
                    {lot.status}
                  </span>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] tracking-[0.16em] text-black/40 uppercase" style={headlineFont}>
                      Current Bid
                    </p>
                    <p className="mt-1 text-4xl font-bold text-black" style={headlineFont}>
                      {formatEth(lot.bidValue)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-5">
                    <div>
                      <p className="text-[10px] tracking-[0.16em] text-black/40 uppercase" style={headlineFont}>
                        Next Minimum
                      </p>
                      <p className="mt-1 text-lg font-bold text-black" style={headlineFont}>
                        {formatEth(lot.minimumNextBidEth)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.16em] text-black/40 uppercase" style={headlineFont}>
                        Highest Wallet
                      </p>
                      <p className="mt-2 font-mono text-xs text-black/72">
                        {shortenHash(lot.highestBidder)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-black/10 bg-white p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-black text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.18em] text-black/42 uppercase" style={headlineFont}>
                      Your Bid
                    </p>
                    <p className="text-sm font-bold tracking-[0.14em] text-black uppercase" style={headlineFont}>
                      {bidStatusLabel}
                    </p>
                  </div>
                </div>

                {effectiveStoredBid ? (
                  <div className="space-y-4">
                    <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-4">
                      <span className="text-[11px] tracking-[0.14em] text-black/45 uppercase" style={headlineFont}>
                        Submitted Amount
                      </span>
                      <span className="text-xl font-bold text-black" style={headlineFont}>
                        {formatEth(effectiveStoredBid.bidAmountEth)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                      <span className="text-[11px] tracking-[0.14em] text-black/45 uppercase" style={headlineFont}>
                        Wallet
                      </span>
                      <span className="font-mono text-xs text-black/72">
                        {shortenHash(effectiveStoredBid.walletAddress)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] tracking-[0.14em] text-black/45 uppercase" style={headlineFont}>
                        Transaction
                      </span>
                      {txHref ? (
                        <a
                          href={txHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-mono text-xs text-black underline"
                        >
                          {shortenHash(effectiveStoredBid.transactionHash)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-black/72">N/A</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-black/58">
                    This browser has no stored bid for the auction yet. You can still review the live
                    state and place a bid from here.
                  </p>
                )}
              </section>

              <section className="border border-black/10 bg-[#f7f7f7] p-6">
                <div className="mb-5 flex items-center gap-3 text-black/55">
                  <ShieldCheck className="h-5 w-5" />
                  <p className="text-[11px] tracking-[0.16em] uppercase" style={headlineFont}>
                    Buyer actions remain available while the auction is live.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBidLot(lot)}
                  disabled={!canPlaceBid(lot)}
                  className="inline-flex min-h-[56px] w-full items-center justify-center bg-black px-6 text-center text-[12px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/45"
                  style={headlineFont}
                >
                  Continue Bidding
                </button>
              </section>
            </aside>
          </div>
        )}
      </main>

      <BidEditingModal
        key={selectedBidLot?.artworkId ?? 'bid-tracker-modal-closed'}
        lot={selectedBidLot}
        isOpen={Boolean(selectedBidLot)}
        onClose={() => {
          setSelectedBidLot(null)
          setStoredBid(getStoredAuctionBid(auctionId))
          void refreshAuction()
        }}
        onRefreshLot={handleRefreshLot}
        onViewOrderStatus={handleTrackBid}
      />
    </div>
  )
}

export default AuctionBidTrackerPage
