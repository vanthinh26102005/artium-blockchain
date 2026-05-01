'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { AlertTriangle, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type CSSProperties } from 'react'
import { getAuctionTimeRemainingDisplay, type AuctionLotStatusKey } from '@domains/auction/utils'
import { ConfirmedBidState } from './ConfirmedBidState'
import { PendingBidState } from './PendingBidState'
import { SubmittingBidState } from './SubmittingBidState'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
} from '@shared/components/ui/dialog'

export type AuctionBidLot = {
  artworkId: string
  onChainOrderId: string
  title: string
  bidValue: number
  minBidIncrementValue: number
  status: string
  statusKey: AuctionLotStatusKey
  endsAt?: string
  imageSrc: string
  imageAlt: string
}

export type BidOrderStatusPayload = {
  lot: AuctionBidLot
  committedBidValue: number
  transactionHash: string
}

type SubmitBidCallbacks = {
  onTransactionHash: (transactionHash: string) => void
}

type BidEditingModalProps = {
  isOpen: boolean
  lot: AuctionBidLot | null
  onClose: () => void
  onSubmitBid: (
    input: { lot: AuctionBidLot; bidAmountEth: string },
    callbacks: SubmitBidCallbacks,
  ) => Promise<{ transactionHash: string }>
  onViewOrderStatus?: (payload: BidOrderStatusPayload) => void
}

const MIN_BID_INCREMENT_ETH = 0.1
const ESTIMATED_ETH_TO_USD = 2575

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const statusBadgeClass: Record<AuctionLotStatusKey, string> = {
  active: 'bg-[#16a34a]',
  'ending-soon': 'bg-[#dc2626]',
  closed: 'bg-[#9ca3af]',
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const formatPreciseEthDisplay = (value: number) => `${value.toFixed(2)} ETH`

const formatUsdEstimate = (value: number) => usdFormatter.format(value * ESTIMATED_ETH_TO_USD)

const getMinimumNextBid = (currentBid: number, minBidIncrement: number) => {
  const safeIncrement = Math.max(MIN_BID_INCREMENT_ETH, minBidIncrement)
  return Number((currentBid > 0 ? currentBid + safeIncrement : safeIncrement).toFixed(6))
}

const getBidModalStatusLabel = (statusKey: AuctionLotStatusKey) => {
  switch (statusKey) {
    case 'active':
      return 'Live Auction'
    case 'ending-soon':
      return 'Ending Soon'
    case 'closed':
      return 'Closed'
    default:
      return 'Auction'
  }
}

export const BidEditingModal = ({
  isOpen,
  lot,
  onClose,
  onSubmitBid,
  onViewOrderStatus,
}: BidEditingModalProps) => {
  const [viewState, setViewState] = useState<
    'editing' | 'submitting' | 'pending' | 'confirmed' | 'failed'
  >('editing')
  const [currentBidValue, setCurrentBidValue] = useState(() => lot?.bidValue ?? 0)
  const [bidAmount, setBidAmount] = useState(() =>
    getMinimumNextBid(
      lot?.bidValue ?? 0,
      lot?.minBidIncrementValue ?? MIN_BID_INCREMENT_ETH,
    ).toFixed(2),
  )
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [committedBidValue, setCommittedBidValue] = useState<number | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [failedBidValue, setFailedBidValue] = useState<number | null>(null)
  const [failureMessage, setFailureMessage] = useState<string | null>(null)
  const lotBidValue = lot?.bidValue ?? 0
  const lotMinBidIncrement = lot?.minBidIncrementValue ?? MIN_BID_INCREMENT_ETH
  const minimumNextBid = getMinimumNextBid(currentBidValue, lotMinBidIncrement)

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

  const handlePlaceBid = async () => {
    if (!isBidValid) {
      return
    }

    setCommittedBidValue(bidAmountValue)
    setTransactionHash(null)
    setFailureMessage(null)
    setViewState('submitting')

    try {
      const result = await onSubmitBid(
        {
          lot,
          bidAmountEth: bidAmountValue.toFixed(18).replace(/\.?0+$/, ''),
        },
        {
          onTransactionHash: (nextTransactionHash) => {
            setTransactionHash(nextTransactionHash)
            setViewState('pending')
          },
        },
      )

      setTransactionHash(result.transactionHash)
      setCurrentBidValue(bidAmountValue)
      setBidAmount(getMinimumNextBid(bidAmountValue, lotMinBidIncrement).toFixed(2))
      setViewState('confirmed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit bid transaction.'
      setFailureMessage(message)
      setFailedBidValue(bidAmountValue)
      setViewState('failed')
    }
  }

  const handleTryAgain = () => {
    setViewState('editing')
  }

  const handleCloseModal = () => {
    setViewState('editing')
    setCurrentBidValue(lotBidValue)
    setBidAmount(getMinimumNextBid(lotBidValue, lotMinBidIncrement).toFixed(2))
    setElapsedSeconds(0)
    setCommittedBidValue(null)
    setTransactionHash(null)
    setFailedBidValue(null)
    setFailureMessage(null)
    onClose()
  }

  if (viewState === 'submitting' && committedBidValue !== null) {
    return (
      <SubmittingBidState
        isOpen={isOpen}
        title={lot.title}
        imageSrc={lot.imageSrc}
        imageAlt={lot.imageAlt}
        committedBidValue={committedBidValue}
        currentBidValue={currentBidValue}
      />
    )
  }

  if (viewState === 'pending' && committedBidValue !== null && transactionHash) {
    return (
      <PendingBidState
        isOpen={isOpen}
        title={lot.title}
        imageSrc={lot.imageSrc}
        imageAlt={lot.imageAlt}
        committedBidValue={committedBidValue}
        transactionHash={transactionHash}
        onClose={handleCloseModal}
      />
    )
  }

  if (viewState === 'confirmed' && committedBidValue !== null && transactionHash) {
    return (
      <ConfirmedBidState
        isOpen={isOpen}
        title={lot.title}
        imageSrc={lot.imageSrc}
        imageAlt={lot.imageAlt}
        committedBidValue={committedBidValue}
        transactionHash={transactionHash}
        onClose={handleCloseModal}
        onViewOrderStatus={
          onViewOrderStatus
            ? () =>
                onViewOrderStatus({
                  lot,
                  committedBidValue,
                  transactionHash,
                })
            : undefined
        }
      />
    )
  }

  if (viewState === 'failed' && failedBidValue !== null) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogPortal>
          <DialogOverlay className="bg-black/35 backdrop-blur-sm" />
          <DialogPrimitive.Content
            aria-labelledby="auction-bid-failed-title"
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="relative w-full max-w-lg overflow-hidden border border-black/10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/70 transition hover:text-black"
                aria-label="Close failed bid panel"
              >
                <X className="h-7 w-7" strokeWidth={1.8} />
              </button>

              <div className="h-1 w-full bg-[#ba1a1a]" />

              <div className="px-8 py-8 md:px-10 md:py-10">
                <header className="mb-8 flex items-start gap-4 pr-10">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ffdad6] text-[#ba1a1a]">
                    <AlertTriangle className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.18em] text-black/45 uppercase" style={headlineFont}>
                      Bid Update
                    </p>
                    <h2
                      id="auction-bid-failed-title"
                      className="mt-2 text-2xl font-bold text-black uppercase"
                      style={headlineFont}
                    >
                      Transaction Failed
                    </h2>
                    <p className="mt-2 text-[10px] tracking-[0.18em] text-black/45 uppercase" style={headlineFont}>
                      Error Code: ERR_BID_EXCEEDED
                    </p>
                  </div>
                </header>

                <div className="mb-8 bg-[#f3f3f3] px-5 py-5">
                  <p className="text-sm leading-7 text-black/72">
                    {failureMessage ??
                      'The on-chain bid could not be completed. Review the transaction details and try again.'}
                  </p>
                </div>

                <div className="space-y-4 border-b border-black/10 pb-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] tracking-[0.16em] text-black/42 uppercase" style={headlineFont}>
                        Current Top Bid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black" style={headlineFont}>
                        {formatPreciseEthDisplay(currentBidValue)}
                      </p>
                      <p className="mt-1 text-[10px] tracking-[0.12em] text-black/45 uppercase" style={headlineFont}>
                        ≈ {formatUsdEstimate(currentBidValue)}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-black/10" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] tracking-[0.16em] text-[#ba1a1a] uppercase" style={headlineFont}>
                        Your Failed Bid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black/48" style={headlineFont}>
                        {formatPreciseEthDisplay(failedBidValue)}
                      </p>
                      <p className="mt-1 text-[10px] tracking-[0.12em] text-black/35 uppercase" style={headlineFont}>
                        ≈ {formatUsdEstimate(failedBidValue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="inline-flex min-h-[56px] items-center justify-center bg-black px-6 text-center text-[12px] tracking-[0.2em] text-white uppercase transition hover:bg-black/90"
                    style={headlineFont}
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex min-h-[56px] items-center justify-center border border-black/15 px-6 text-center text-[12px] tracking-[0.2em] text-black uppercase transition hover:border-black/30 hover:bg-black/[0.03]"
                    style={headlineFont}
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>

              <footer className="flex items-center justify-between gap-4 bg-[#f3f3f3] px-8 py-5 md:px-10">
                <div className="flex min-w-0 items-center gap-2 text-black/45">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="truncate text-[10px] tracking-[0.14em] uppercase" style={headlineFont}>
                    Secure blockchain verification
                  </span>
                </div>
                <span className="shrink-0 text-[10px] tracking-[0.14em] text-black/35 uppercase" style={headlineFont}>
                  v2.4.0
                </span>
              </footer>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
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
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/70 transition hover:text-black"
              aria-label="Close bid panel"
            >
              <X className="h-7 w-7" strokeWidth={1.8} />
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

            <div className="flex w-full flex-col overflow-hidden md:w-7/12">
              <div className="flex-1 overflow-y-auto px-6 pt-6 md:px-10 md:pt-10">
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

                <section className="pt-8 pb-8">
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
                        Approx. USD Value
                      </p>
                      <p className="mt-2 text-base text-black" style={headlineFont}>
                        ≈{' '}
                        {isBidValid
                          ? formatUsdEstimate(bidAmountValue)
                          : formatUsdEstimate(minimumNextBid)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="border-t border-black/10 bg-white px-6 pt-5 pb-6 shadow-[0_-18px_32px_-24px_rgba(0,0,0,0.16)] md:px-10 md:pt-6">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.16em] text-black/42 uppercase" style={headlineFont}>
                      Ready to Bid
                    </p>
                    <p className="mt-2 text-sm text-black/60">
                      {isBidValid
                        ? `Submitting ${formatPreciseEthDisplay(bidAmountValue)} for this lot.`
                        : `Minimum next bid is ${formatPreciseEthDisplay(minimumNextBid)}.`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] tracking-[0.16em] text-black/40 uppercase" style={headlineFont}>
                      Approx. USD Value
                    </p>
                    <p className="mt-1 text-base text-black" style={headlineFont}>
                      ≈{' '}
                      {isBidValid
                        ? formatUsdEstimate(bidAmountValue)
                        : formatUsdEstimate(minimumNextBid)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <button
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={!isBidValid}
                    className="order-1 inline-flex min-h-[56px] flex-1 items-center justify-center bg-black px-6 text-center text-[12px] tracking-[0.2em] text-white uppercase transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/45 md:order-2"
                    style={headlineFont}
                  >
                    Place Bid
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="order-2 inline-flex min-h-[56px] items-center justify-center border border-black/15 px-6 text-center text-[12px] tracking-[0.2em] text-black uppercase transition hover:border-black/30 hover:bg-black/[0.03] md:order-1 md:w-[180px]"
                    style={headlineFont}
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-4 text-center text-[11px] leading-5 text-black/45">
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
