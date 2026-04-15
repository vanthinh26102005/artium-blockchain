'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type CSSProperties } from 'react'
import { type DiscoverArtworkAuctionStatusKey } from '@domains/discover/mock/mockArtworks'
import { getAuctionTimeRemainingDisplay } from '@domains/auction/utils'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
} from '@shared/components/ui/dialog'

export type AuctionBidLot = {
  artworkId: string
  title: string
  bidValue: number
  status: string
  statusKey: DiscoverArtworkAuctionStatusKey
  endsAt?: string
  imageSrc: string
  imageAlt: string
}

type BidEditingModalProps = {
  isOpen: boolean
  lot: AuctionBidLot | null
  onClose: () => void
}

const MIN_BID_INCREMENT_ETH = 0.1
const BID_INCREMENT_RATE = 0.05
const MOCK_ETH_TO_USD = 2575

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const bodyFont = {
  fontFamily: 'Inter, "Segoe UI", Tahoma, sans-serif',
} satisfies CSSProperties

const statusBadgeClass: Record<DiscoverArtworkAuctionStatusKey, string> = {
  active: 'bg-[#16a34a]',
  'ending-soon': 'bg-[#dc2626]',
  closed: 'bg-[#9ca3af]',
  'newly-listed': 'bg-[#2563eb]',
  paused: 'bg-[#eab308]',
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const formatPreciseEthDisplay = (value: number) => `${value.toFixed(2)} ETH`

const formatUsdEstimate = (value: number) => usdFormatter.format(value * MOCK_ETH_TO_USD)

const getMinimumNextBid = (currentBid: number) =>
  Number((currentBid + Math.max(MIN_BID_INCREMENT_ETH, currentBid * BID_INCREMENT_RATE)).toFixed(2))

const getBidModalStatusLabel = (statusKey: DiscoverArtworkAuctionStatusKey) => {
  switch (statusKey) {
    case 'active':
      return 'Live Auction'
    case 'ending-soon':
      return 'Ending Soon'
    case 'newly-listed':
      return 'Newly Listed'
    case 'paused':
      return 'Paused'
    case 'closed':
      return 'Closed'
    default:
      return 'Auction'
  }
}

export const BidEditingModal = ({ isOpen, lot, onClose }: BidEditingModalProps) => {
  const minimumNextBid = lot ? getMinimumNextBid(lot.bidValue) : 0
  const [bidAmount, setBidAmount] = useState(() => minimumNextBid.toFixed(2))
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isOpen])

  if (!lot) {
    return null
  }

  const bidAmountValue = Number.parseFloat(bidAmount)
  const isBidAmountEmpty = bidAmount.trim().length === 0
  const isBidAmountInvalid = !isBidAmountEmpty && Number.isNaN(bidAmountValue)
  const isBidBelowMinimum = !isBidAmountInvalid && !isBidAmountEmpty && bidAmountValue < minimumNextBid
  const validationMessage = isBidAmountEmpty
    ? 'Enter your bid amount in ETH.'
    : isBidAmountInvalid
      ? 'Bid amount must be a valid number.'
      : isBidBelowMinimum
        ? `Your bid must be at least ${formatPreciseEthDisplay(minimumNextBid)}.`
        : `Ready to submit above the minimum bid threshold of ${formatPreciseEthDisplay(minimumNextBid)}.`
  const isBidValid = !isBidAmountEmpty && !isBidAmountInvalid && !isBidBelowMinimum
  const bidSpread = isBidValid ? Math.max(0, bidAmountValue - minimumNextBid) : 0
  const timeRemainingDisplay = getAuctionTimeRemainingDisplay({
    status: lot.status,
    statusKey: lot.statusKey,
    endsAt: lot.endsAt,
    elapsedSeconds,
  })

  const handleBidAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value

    if (/^\d*(\.\d{0,2})?$/.test(nextValue)) {
      setBidAmount(nextValue)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-labelledby="auction-bid-modal-title"
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-black/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)] md:max-h-[86vh] md:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/92 text-black transition hover:border-black hover:bg-white"
              aria-label="Close bid panel"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative min-h-[260px] w-full bg-[#f3f3f3] md:min-h-full md:w-5/12">
              <Image
                src={lot.imageSrc}
                alt={lot.imageAlt}
                fill
                sizes="(min-width: 768px) 34vw, 100vw"
                className="object-cover grayscale-[0.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 py-5 text-white md:px-6 md:py-6">
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.22em] text-white/72 uppercase" style={headlineFont}>
                    Ref. {lot.artworkId.toUpperCase()}
                  </p>
                  <p className="mt-2 text-sm text-white/88">Curated live-auction selection on Artium.</p>
                </div>
                <div className="flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusBadgeClass[lot.statusKey]} ${
                      lot.statusKey === 'active' || lot.statusKey === 'ending-soon'
                        ? 'animate-pulse'
                        : ''
                    }`}
                  />
                  <span className="text-[10px] tracking-[0.16em] text-white uppercase" style={headlineFont}>
                    {getBidModalStatusLabel(lot.statusKey)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col justify-between overflow-y-auto p-6 md:w-7/12 md:p-10">
              <div>
                <header className="mb-10 border-b border-black/10 pb-8">
                  <p className="text-[11px] tracking-[0.28em] text-black/45 uppercase" style={headlineFont}>
                    Place a Bid
                  </p>
                  <h2
                    id="auction-bid-modal-title"
                    className="mt-3 text-3xl leading-tight font-bold text-black uppercase md:text-4xl"
                    style={headlineFont}
                  >
                    {lot.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#5f5e5e]" style={bodyFont}>
                    Review the current auction position, enter a valid bid amount, and prepare the
                    form state for transaction handling in the next implementation step.
                  </p>
                </header>

                <section className="grid grid-cols-1 gap-6 border-b border-black/10 pb-8 md:grid-cols-2 md:gap-10">
                  <div className="space-y-1">
                    <p className="text-[11px] tracking-[0.14em] text-black/45 uppercase" style={headlineFont}>
                      Current Bid
                    </p>
                    <p className="text-2xl font-semibold text-black md:text-3xl" style={headlineFont}>
                      {formatPreciseEthDisplay(lot.bidValue)}
                    </p>
                    <p className="text-xs text-black/45">{formatUsdEstimate(lot.bidValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] tracking-[0.14em] text-black/45 uppercase" style={headlineFont}>
                      Time Remaining
                    </p>
                    <p
                      className={`text-2xl font-semibold md:text-3xl ${timeRemainingDisplay.tone.className}`}
                      style={headlineFont}
                    >
                      {timeRemainingDisplay.label}
                    </p>
                    <p className={`text-xs ${timeRemainingDisplay.tone.helperClassName}`}>
                      {timeRemainingDisplay.note}
                    </p>
                  </div>
                </section>

                <section className="pt-8">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <label
                      htmlFor="bid-amount"
                      className="text-[11px] tracking-[0.14em] text-black/50 uppercase"
                      style={headlineFont}
                    >
                      Your Bid Amount (ETH)
                    </label>
                    <span
                      className="text-[11px] tracking-[0.14em] text-black/65 uppercase"
                      style={headlineFont}
                    >
                      Min. Next Bid: {formatPreciseEthDisplay(minimumNextBid)}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id="bid-amount"
                      type="text"
                      inputMode="decimal"
                      value={bidAmount}
                      onChange={handleBidAmountChange}
                      aria-invalid={!isBidValid && !isBidAmountEmpty ? 'true' : 'false'}
                      className={`w-full border-b bg-transparent py-4 pr-14 text-4xl text-black outline-none transition placeholder:text-black/12 md:text-5xl ${
                        !isBidValid && !isBidAmountEmpty
                          ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
                          : 'border-black/15 focus:border-black'
                      }`}
                      style={headlineFont}
                      placeholder={minimumNextBid.toFixed(2)}
                    />
                    <span
                      className="pointer-events-none absolute right-0 bottom-5 text-lg text-black/45 transition-colors"
                      style={headlineFont}
                    >
                      ETH
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p
                      className={`text-[12px] leading-6 ${
                        !isBidValid && !isBidAmountEmpty ? 'text-[#ba1a1a]' : 'text-black/55'
                      }`}
                    >
                      {validationMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => setBidAmount(minimumNextBid.toFixed(2))}
                      className="text-left text-[11px] tracking-[0.18em] text-black uppercase transition hover:text-black/60 md:text-right"
                      style={headlineFont}
                    >
                      Use Minimum
                    </button>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 border-t border-black/10 pt-6 text-sm text-black/55 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] tracking-[0.14em] text-black/40 uppercase" style={headlineFont}>
                        Minimum Increment
                      </p>
                      <p className="mt-2 text-base text-black" style={headlineFont}>
                        {formatPreciseEthDisplay(minimumNextBid - lot.bidValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] tracking-[0.14em] text-black/40 uppercase" style={headlineFont}>
                        Estimate At Your Bid
                      </p>
                      <p className="mt-2 text-base text-black" style={headlineFont}>
                        {isBidValid
                          ? formatUsdEstimate(bidAmountValue)
                          : formatUsdEstimate(minimumNextBid)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="mt-10 border-t border-black/10 pt-8">
                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-[56px] items-center justify-center border border-black/15 px-6 text-center text-[12px] tracking-[0.2em] text-black uppercase transition hover:border-black hover:bg-black hover:text-white md:w-[180px]"
                    style={headlineFont}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!isBidValid}
                    className="inline-flex min-h-[56px] flex-1 items-center justify-center bg-black px-6 text-center text-[12px] tracking-[0.2em] text-white uppercase transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/45"
                    style={headlineFont}
                  >
                    Place Bid
                  </button>
                </div>
                <p className="mt-5 text-center text-[11px] leading-5 text-black/45">
                  By placing a bid, you agree to Artium&apos;s live-auction terms. Confirmation,
                  pending, and failure states can be layered onto this layout next without changing
                  the form structure.
                </p>
                {isBidValid && bidSpread > 0 ? (
                  <p className="mt-3 text-center text-[11px] leading-5 text-black/55">
                    Your current entry is {formatPreciseEthDisplay(bidSpread)} above the minimum
                    next bid.
                  </p>
                ) : null}
              </footer>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
