'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { AlertTriangle, ShieldCheck, X } from 'lucide-react'
import { useCallback, useEffect, useState, type ChangeEvent, type CSSProperties } from 'react'
import { getAuctionTimeRemainingDisplay } from '@domains/auction/utils'
import { AuctionBidWalletError, submitAuctionBid } from '@domains/auction/services/auctionBidWallet'
import { ConfirmedBidState } from './ConfirmedBidState'
import { PendingBidState } from './PendingBidState'
import { SubmittingBidState } from './SubmittingBidState'
import { Dialog, DialogOverlay, DialogPortal, DialogPrimitive } from '@shared/components/ui/dialog'

type AuctionBidLotStatusKey = 'active' | 'ending-soon' | 'closed' | 'newly-listed' | 'paused'

export type AuctionBidLot = {
  artworkId: string
  auctionId?: string
  onChainOrderId?: string
  title: string
  bidValue: number
  status: string
  statusKey: AuctionBidLotStatusKey
  endsAt?: string
  imageSrc: string
  imageAlt: string
  minimumNextBidEth?: number
  highestBidder?: string | null
  contractAddress?: string | null
}

export type BidOrderStatusPayload = {
  lot: AuctionBidLot
  committedBidValue: number
  transactionHash: string
}

type BidEditingModalProps = {
  isOpen: boolean
  lot: AuctionBidLot | null
  onClose: () => void
  onRefreshLot?: (auctionId: string) => Promise<AuctionBidLot>
  onViewOrderStatus?: (payload: BidOrderStatusPayload) => void
}

/**
 * MIN_BID_INCREMENT_ETH - React component
 * @returns React element
 */
const MIN_BID_INCREMENT_ETH = 0.1
const BID_INCREMENT_RATE = 0.05
const MOCK_ETH_TO_USD = 2575

/**
 * BID_INCREMENT_RATE - React component
 * @returns React element
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})
/**
 * MOCK_ETH_TO_USD - React component
 * @returns React element
 */

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

/**
 * spaceGrotesk - Utility function
 * @returns void
 */
const statusBadgeClass: Record<AuctionBidLotStatusKey, string> = {
  active: 'bg-[#16a34a]',
  'ending-soon': 'bg-[#dc2626]',
  closed: 'bg-[#9ca3af]',
  'newly-listed': 'bg-[#2563eb]',
  paused: 'bg-[#eab308]',
}

/**
 * headlineFont - Utility function
 * @returns void
 */
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const formatPreciseEthDisplay = (value: number) => `${value.toFixed(2)} ETH`
/**
 * statusBadgeClass - Utility function
 * @returns void
 */

const formatUsdEstimate = (value: number) => usdFormatter.format(value * MOCK_ETH_TO_USD)

const getMinimumNextBid = (currentBid: number) =>
  Number((currentBid + Math.max(MIN_BID_INCREMENT_ETH, currentBid * BID_INCREMENT_RATE)).toFixed(2))

const getBidModalStatusLabel = (statusKey: AuctionBidLotStatusKey) => {
  switch (statusKey) {
    case 'active':
      return 'Live Auction'
    case 'ending-soon':
      /**
       * usdFormatter - Utility function
       * @returns void
       */
      return 'Ending Soon'
    case 'newly-listed':
      return 'Newly Listed'
    case 'paused':
      return 'Paused'
    case 'closed':
      return 'Closed'
    default:
      return 'Auction'
    /**
     * formatPreciseEthDisplay - Utility function
     * @returns void
     */
  }
}

const normalizeWalletAddress = (value?: string | null) => value?.trim().toLowerCase() ?? null

/**
 * formatUsdEstimate - Utility function
 * @returns void
 */
export const BidEditingModal = ({
  isOpen,
  lot,
  onClose,
  onRefreshLot,
  /**
   * getMinimumNextBid - Utility function
   * @returns void
   */
  onViewOrderStatus,
}: BidEditingModalProps) => {
  const [viewState, setViewState] = useState<
    'editing' | 'submitting' | 'pending' | 'confirmed' | 'failed'
  >('editing')
  const [currentBidValue, setCurrentBidValue] = useState(() => lot?.bidValue ?? 0)
  /**
   * getBidModalStatusLabel - Utility function
   * @returns void
   */
  const [minimumNextBid, setMinimumNextBid] = useState(
    () => lot?.minimumNextBidEth ?? getMinimumNextBid(lot?.bidValue ?? 0),
  )
  const [bidAmount, setBidAmount] = useState(() => minimumNextBid.toFixed(2))
  const [statusKey, setStatusKey] = useState<AuctionBidLotStatusKey>(
    () => lot?.statusKey ?? 'active',
  )
  const [endsAt, setEndsAt] = useState<string | undefined>(() => lot?.endsAt)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [committedBidValue, setCommittedBidValue] = useState<number | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [submittedWalletAddress, setSubmittedWalletAddress] = useState<string | null>(null)
  const [failedBidValue, setFailedBidValue] = useState<number | null>(null)
  const [failureMessage, setFailureMessage] = useState<string | null>(null)
  const lotBidValue = lot?.bidValue ?? 0
  const auctionId = lot?.auctionId ?? lot?.artworkId

  useEffect(() => {
    if (!isOpen) {
      return
    }

    /**
     * normalizeWalletAddress - Utility function
     * @returns void
     */
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
    /**
     * BidEditingModal - React component
     * @returns React element
     */
  }, [isOpen])

  const applyLotState = useCallback(
    (nextLot: AuctionBidLot, options?: { resetBidAmount?: boolean }) => {
      const nextMinimumBid = nextLot.minimumNextBidEth ?? getMinimumNextBid(nextLot.bidValue)
      setCurrentBidValue(nextLot.bidValue)
      setMinimumNextBid(nextMinimumBid)
      setStatusKey(nextLot.statusKey)
      setEndsAt(nextLot.endsAt)

      if (options?.resetBidAmount) {
        setBidAmount(nextMinimumBid.toFixed(2))
      }
    },
    [],
  )

  useEffect(() => {
    if (!isOpen || !lot || viewState !== 'editing') {
      return
    }

    let cancelled = false

    const refreshInitialLot = async () => {
      if (!onRefreshLot || !auctionId) {
        /**
         * lotBidValue - Utility function
         * @returns void
         */
        applyLotState(lot, { resetBidAmount: true })
        return
      }

      /**
       * auctionId - Utility function
       * @returns void
       */
      try {
        const refreshedLot = await onRefreshLot(auctionId)
        if (!cancelled) {
          applyLotState(refreshedLot, { resetBidAmount: true })
        }
      } catch {
        if (!cancelled) {
          applyLotState(lot, { resetBidAmount: true })
        }
      }
      /**
       * intervalId - Utility function
       * @returns void
       */
    }

    void refreshInitialLot()

    return () => {
      cancelled = true
    }
  }, [applyLotState, auctionId, isOpen, lot, onRefreshLot, viewState])

  useEffect(() => {
    /**
     * applyLotState - Utility function
     * @returns void
     */
    if (
      !isOpen ||
      viewState !== 'pending' ||
      committedBidValue === null ||
      transactionHash === null ||
      /**
       * nextMinimumBid - Utility function
       * @returns void
       */
      !auctionId ||
      !onRefreshLot
    ) {
      return
    }

    let cancelled = false
    let attempts = 0

    const checkBackendState = async () => {
      attempts += 1

      try {
        const refreshedLot = await onRefreshLot(auctionId)
        if (cancelled) {
          return
        }

        applyLotState(refreshedLot)

        const refreshedBidder = normalizeWalletAddress(refreshedLot.highestBidder)
        const submittedBidder = normalizeWalletAddress(submittedWalletAddress)
        const bidIsAuthoritative =
          /**
           * refreshInitialLot - Utility function
           * @returns void
           */
          Boolean(refreshedBidder && submittedBidder && refreshedBidder === submittedBidder) &&
          refreshedLot.bidValue >= committedBidValue

        if (bidIsAuthoritative) {
          setCurrentBidValue(refreshedLot.bidValue)
          setViewState('confirmed')
          return
        }

        const minimumNextBidMovedPastSubmission =
          /**
           * refreshedLot - Utility function
           * @returns void
           */
          (refreshedLot.minimumNextBidEth ?? getMinimumNextBid(refreshedLot.bidValue)) >
          committedBidValue
        const competingBidMovedPastSubmission = refreshedLot.bidValue > committedBidValue

        if (
          (minimumNextBidMovedPastSubmission || competingBidMovedPastSubmission) &&
          refreshedBidder !== submittedBidder
        ) {
          const nextMinimumBid =
            refreshedLot.minimumNextBidEth ?? getMinimumNextBid(refreshedLot.bidValue)
          setFailedBidValue(committedBidValue)
          setFailureMessage(
            'Backend auction state now requires a higher minimum bid. Review the latest current bid and try again.',
          )
          setBidAmount(nextMinimumBid.toFixed(2))
          setViewState('failed')
        }
      } catch {
        if (!cancelled && attempts >= 20) {
          setFailedBidValue(committedBidValue)
          setFailureMessage(
            'We could not confirm this bid from backend auction state. Refresh the lot and review the newest current bid before trying again.',
          )
          setViewState('failed')
        }
      }
    }

    void checkBackendState()
    const intervalId = window.setInterval(() => {
      void checkBackendState()
    }, 3500)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      /**
       * checkBackendState - Utility function
       * @returns void
       */
    }
  }, [
    applyLotState,
    auctionId,
    committedBidValue,
    isOpen,
    onRefreshLot,
    /**
     * refreshedLot - Utility function
     * @returns void
     */
    submittedWalletAddress,
    transactionHash,
    viewState,
  ])

  if (!lot) {
    return null
  }

  const bidAmountValue = Number.parseFloat(bidAmount)
  /**
   * refreshedBidder - Utility function
   * @returns void
   */
  const isBidAmountEmpty = bidAmount.trim().length === 0
  const isBidAmountInvalid = !isBidAmountEmpty && Number.isNaN(bidAmountValue)
  const isBidBelowMinimum =
    !isBidAmountInvalid && !isBidAmountEmpty && bidAmountValue < minimumNextBid
  const validationMessage = isBidAmountEmpty
    ? /**
       * submittedBidder - Utility function
       * @returns void
       */
      'Enter your bid amount in ETH.'
    : isBidAmountInvalid
      ? 'Bid amount must be a valid number.'
      : isBidBelowMinimum
        ? /**
           * bidIsAuthoritative - Utility function
           * @returns void
           */
          `Your bid must be at least ${formatPreciseEthDisplay(minimumNextBid)}.`
        : `Ready to submit above the minimum bid threshold of ${formatPreciseEthDisplay(minimumNextBid)}.`
  const isBidValid = !isBidAmountEmpty && !isBidAmountInvalid && !isBidBelowMinimum
  const bidSpread = isBidValid ? Math.max(0, bidAmountValue - minimumNextBid) : 0
  const timeRemainingDisplay = getAuctionTimeRemainingDisplay({
    status: lot.status,
    statusKey,
    endsAt,
    elapsedSeconds,
  })

  const handleBidAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    /**
     * minimumNextBidMovedPastSubmission - Utility function
     * @returns void
     */

    if (/^\d*(\.\d{0,2})?$/.test(nextValue)) {
      setBidAmount(nextValue)
    }
  }

  /**
   * competingBidMovedPastSubmission - Utility function
   * @returns void
   */
  const handlePlaceBid = async () => {
    if (!isBidValid) {
      return
    }

    if (!lot.contractAddress || !lot.onChainOrderId) {
      setCommittedBidValue(bidAmountValue)
      setFailedBidValue(bidAmountValue)
      setFailureMessage('This auction is missing contract data. Refresh the lot and try again.')
      /**
       * nextMinimumBid - Utility function
       * @returns void
       */
      setViewState('failed')
      return
    }

    setCommittedBidValue(bidAmountValue)
    setTransactionHash(null)
    setSubmittedWalletAddress(null)
    setFailureMessage(null)
    setViewState('submitting')

    try {
      const result = await submitAuctionBid({
        auctionId: lot.onChainOrderId,
        contractAddress: lot.contractAddress,
        bidAmountEth: bidAmount,
      })
      setTransactionHash(result.txHash)
      setSubmittedWalletAddress(result.walletAddress)
      setViewState('pending')
      if (onRefreshLot && auctionId) {
        void onRefreshLot(auctionId)
      }
    } catch (error) {
      const message =
        /**
         * intervalId - Utility function
         * @returns void
         */
        error instanceof AuctionBidWalletError
          ? error.message
          : 'MetaMask could not submit the bid transaction.'
      setFailedBidValue(bidAmountValue)
      setFailureMessage(message)
      setViewState('failed')
    }
  }

  const handleTryAgain = () => {
    setCommittedBidValue(null)
    setTransactionHash(null)
    setSubmittedWalletAddress(null)
    setFailedBidValue(null)
    setFailureMessage(null)
    setViewState('editing')
  }

  const handleCloseModal = () => {
    setViewState('editing')
    setCurrentBidValue(lotBidValue)
    setBidAmount(getMinimumNextBid(lotBidValue).toFixed(2))
    setElapsedSeconds(0)
    setCommittedBidValue(null)
    setTransactionHash(null)
    setSubmittedWalletAddress(null)
    /**
     * bidAmountValue - Utility function
     * @returns void
     */
    setFailedBidValue(null)
    setFailureMessage(null)
    onClose()
  }
  /**
   * isBidAmountEmpty - Utility function
   * @returns void
   */

  if (viewState === 'submitting' && committedBidValue !== null) {
    return (
      <SubmittingBidState
        /**
         * isBidAmountInvalid - Utility function
         * @returns void
         */
        isOpen={isOpen}
        title={lot.title}
        imageSrc={lot.imageSrc}
        imageAlt={lot.imageAlt}
        /**
         * isBidBelowMinimum - Utility function
         * @returns void
         */
        committedBidValue={committedBidValue}
        currentBidValue={currentBidValue}
      />
    )
    /**
     * validationMessage - Utility function
     * @returns void
     */
  }

  if (viewState === 'pending' && committedBidValue !== null && transactionHash) {
    return (
      <PendingBidState
        isOpen={isOpen}
        title={lot.title}
        imageSrc={lot.imageSrc}
        imageAlt={lot.imageAlt}
        committedBidValue={committedBidValue}
        /**
         * isBidValid - Utility function
         * @returns void
         */
        transactionHash={transactionHash}
        onClose={handleCloseModal}
      />
    )
    /**
     * bidSpread - Utility function
     * @returns void
     */
  }

  if (viewState === 'confirmed' && committedBidValue !== null && transactionHash) {
    return (
      /**
       * timeRemainingDisplay - Utility function
       * @returns void
       */
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
            ? /**
               * handleBidAmountChange - Utility function
               * @returns void
               */
              () =>
                onViewOrderStatus({
                  lot,
                  committedBidValue,
                  /**
                   * nextValue - Utility function
                   * @returns void
                   */
                  transactionHash,
                })
            : undefined
        }
      />
    )
  }

  if (viewState === 'failed' && failedBidValue !== null) {
    return (
      /**
       * handlePlaceBid - Utility function
       * @returns void
       */
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
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/70 transition hover:text-black"
                aria-label="Close failed bid panel"
              >
                <X className="h-7 w-7" strokeWidth={1.8} />
              </button>

              <div className="h-1 w-full bg-[#ba1a1a]" />

              <div className="px-8 py-8 md:px-10 md:py-10">
                <header className="mb-8 flex items-start gap-4 pr-10">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ffdad6] text-[#ba1a1a]">
                    /** * result - Utility function * @returns void */
                    <AlertTriangle className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-[0.18em] text-black/45"
                      style={headlineFont}
                    >
                      Bid Update
                    </p>
                    <h2
                      id="auction-bid-failed-title"
                      className="mt-2 text-2xl font-bold uppercase text-black"
                      style={headlineFont}
                    >
                      Transaction Failed
                    </h2>
                    <p
                      className="mt-2 text-[10px] uppercase tracking-[0.18em] text-black/45"
                      style={headlineFont}
                    >
                      Backend state requires review /** * message - Utility function * @returns void
                      */
                    </p>
                  </div>
                </header>

                <div className="mb-8 bg-[#f3f3f3] px-5 py-5">
                  <p className="text-black/72 text-sm leading-7">
                    {failureMessage ??
                      'Another bidder has placed a higher bid while your transaction was being processed. Please increase your bid amount to continue.'}
                  </p>
                </div>

                <div className="space-y-4 border-b border-black/10 pb-8">
                  <div className="flex items-end justify-between gap-4">
                    /** * handleTryAgain - Utility function * @returns void */
                    <div>
                      <p
                        className="text-black/42 text-[10px] uppercase tracking-[0.16em]"
                        style={headlineFont}
                      >
                        Current Top Bid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black" style={headlineFont}>
                        {formatPreciseEthDisplay(currentBidValue)}
                      </p>
                      <p
                        className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/45"
                        style={headlineFont}
                      >
                        ≈ {formatUsdEstimate(currentBidValue)}
                      </p>
                      /** * handleCloseModal - Utility function * @returns void */
                    </div>
                  </div>

                  <div className="h-px w-full bg-black/10" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.16em] text-[#ba1a1a]"
                        style={headlineFont}
                      >
                        Your Submitted Bid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-black/48 text-2xl font-bold" style={headlineFont}>
                        {formatPreciseEthDisplay(failedBidValue)}
                      </p>
                      <p
                        className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/35"
                        style={headlineFont}
                      >
                        ≈ {formatUsdEstimate(failedBidValue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="inline-flex min-h-[56px] items-center justify-center bg-black px-6 text-center text-[12px] uppercase tracking-[0.2em] text-white transition hover:bg-black/90"
                    style={headlineFont}
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex min-h-[56px] items-center justify-center border border-black/15 px-6 text-center text-[12px] uppercase tracking-[0.2em] text-black transition hover:border-black/30 hover:bg-black/[0.03]"
                    style={headlineFont}
                  >
                    Close
                  </button>
                </div>
              </div>

              <footer className="flex items-center justify-between gap-4 bg-[#f3f3f3] px-8 py-5 md:px-10">
                <div className="flex min-w-0 items-center gap-2 text-black/45">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span
                    className="truncate text-[10px] uppercase tracking-[0.14em]"
                    style={headlineFont}
                  >
                    Secure blockchain verification
                  </span>
                </div>
                <span
                  className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-black/35"
                  style={headlineFont}
                >
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
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/70 transition hover:text-black"
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
                  <p
                    className="text-white/72 text-[10px] uppercase tracking-[0.22em]"
                    style={headlineFont}
                  >
                    Ref. {lot.artworkId.toUpperCase()}
                  </p>
                  <p className="text-white/88 mt-2 text-sm">
                    Curated live-auction selection on Artium.
                  </p>
                </div>
                <div className="flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusBadgeClass[statusKey]} ${
                      statusKey === 'active' || statusKey === 'ending-soon' ? 'animate-pulse' : ''
                    }`}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.16em] text-white"
                    style={headlineFont}
                  >
                    {getBidModalStatusLabel(statusKey)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col overflow-hidden md:w-7/12">
              <div className="flex-1 overflow-y-auto px-6 pt-6 md:px-10 md:pt-10">
                <header className="mb-10 border-b border-black/10 pb-8">
                  <p
                    className="text-[11px] uppercase tracking-[0.28em] text-black/45"
                    style={headlineFont}
                  >
                    Place a Bid
                  </p>
                  <h2
                    id="auction-bid-modal-title"
                    className="mt-3 text-3xl font-bold uppercase leading-tight text-black md:text-4xl"
                    style={headlineFont}
                  >
                    {lot.title}
                  </h2>
                </header>

                <section className="grid grid-cols-1 gap-6 border-b border-black/10 pb-8 md:grid-cols-2 md:gap-10">
                  <div className="space-y-1">
                    <p
                      className="text-[11px] uppercase tracking-[0.14em] text-black/45"
                      style={headlineFont}
                    >
                      Current Bid
                    </p>
                    <p
                      className="text-2xl font-semibold text-black md:text-3xl"
                      style={headlineFont}
                    >
                      {formatPreciseEthDisplay(currentBidValue)}
                    </p>
                    <p className="text-xs text-black/45">{formatUsdEstimate(currentBidValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p
                      className="text-[11px] uppercase tracking-[0.14em] text-black/45"
                      style={headlineFont}
                    >
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

                <section className="pb-8 pt-8">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <label
                      htmlFor="bid-amount"
                      className="text-[11px] uppercase tracking-[0.14em] text-black/50"
                      style={headlineFont}
                    >
                      Your Bid Amount (ETH)
                    </label>
                    <span
                      className="text-[11px] uppercase tracking-[0.14em] text-black/65"
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
                      className={`placeholder:text-black/12 w-full border-b bg-transparent py-4 pr-14 text-4xl text-black outline-none transition md:text-5xl ${
                        !isBidValid && !isBidAmountEmpty
                          ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
                          : 'border-black/15 focus:border-black'
                      }`}
                      style={headlineFont}
                      placeholder={minimumNextBid.toFixed(2)}
                    />
                    <span
                      className="pointer-events-none absolute bottom-5 right-0 text-lg text-black/45 transition-colors"
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
                      className="text-left text-[11px] uppercase tracking-[0.18em] text-black transition hover:text-black/60 md:text-right"
                      style={headlineFont}
                    >
                      Use Minimum
                    </button>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 border-t border-black/10 pt-6 text-sm text-black/55 md:grid-cols-2">
                    <div>
                      <p
                        className="text-[11px] uppercase tracking-[0.14em] text-black/40"
                        style={headlineFont}
                      >
                        Minimum Increment
                      </p>
                      <p className="mt-2 text-base text-black" style={headlineFont}>
                        {formatPreciseEthDisplay(Math.max(0, minimumNextBid - currentBidValue))}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[11px] uppercase tracking-[0.14em] text-black/40"
                        style={headlineFont}
                      >
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

              <footer className="border-t border-black/10 bg-white px-6 pb-6 pt-5 shadow-[0_-18px_32px_-24px_rgba(0,0,0,0.16)] md:px-10 md:pt-6">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <div className="min-w-0">
                    <p
                      className="text-black/42 text-[11px] uppercase tracking-[0.16em]"
                      style={headlineFont}
                    >
                      Ready to Bid
                    </p>
                    <p className="mt-2 text-sm text-black/60">
                      {isBidValid
                        ? `Submitting ${formatPreciseEthDisplay(bidAmountValue)} for this lot.`
                        : `Minimum next bid is ${formatPreciseEthDisplay(minimumNextBid)}.`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className="text-[10px] uppercase tracking-[0.16em] text-black/40"
                      style={headlineFont}
                    >
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
                    onClick={() => {
                      void handlePlaceBid()
                    }}
                    disabled={!isBidValid}
                    className="order-1 inline-flex min-h-[56px] flex-1 items-center justify-center bg-black px-6 text-center text-[12px] uppercase tracking-[0.2em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/45 md:order-2"
                    style={headlineFont}
                  >
                    Place Bid
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="order-2 inline-flex min-h-[56px] items-center justify-center border border-black/15 px-6 text-center text-[12px] uppercase tracking-[0.2em] text-black transition hover:border-black/30 hover:bg-black/[0.03] md:order-1 md:w-[180px]"
                    style={headlineFont}
                  >
                    Back to Auction
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
