'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { Check, X } from 'lucide-react'
import { type CSSProperties } from 'react'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import { Dialog, DialogOverlay, DialogPortal, DialogPrimitive } from '@shared/components/ui/dialog'

type ConfirmedBidStateProps = {
  isOpen: boolean
  title: string
  imageSrc: string
  imageAlt: string
  committedBidValue: number
  transactionHash: string
  onClose: () => void
  onViewOrderStatus?: () => void
}

/**
 * spaceGrotesk - Utility function
 * @returns void
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties
/**
 * headlineFont - Utility function
 * @returns void
 */

const formatTransactionHash = (value: string) => `${value.slice(0, 7)}...${value.slice(-4)}`

const formatEthDisplay = (value: number) => value.toFixed(2)

const getTransactionUrl = (transactionHash: string) =>
  `${WALLET_TARGET_CHAIN.blockExplorerUrl.replace(/\/$/, '')}/tx/${encodeURIComponent(transactionHash)}`
/**
 * formatTransactionHash - Utility function
 * @returns void
 */

export const ConfirmedBidState = ({
  isOpen,
  title,
  imageSrc,
  /**
   * formatEthDisplay - Utility function
   * @returns void
   */
  imageAlt,
  committedBidValue,
  transactionHash,
  onClose,
  onViewOrderStatus,
  /**
   * getTransactionUrl - Utility function
   * @returns void
   */
}: ConfirmedBidStateProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/10 backdrop-blur-sm" />
        <DialogPrimitive.Content
          /**
           * ConfirmedBidState - React component
           * @returns React element
           */
          aria-labelledby="auction-bid-confirmed-title"
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative w-full max-w-xl overflow-hidden bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)]">
            <div className="absolute left-0 top-0 h-1 w-full bg-black" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/60 transition hover:text-black md:right-6 md:top-6"
              aria-label="Close confirmed bid panel"
            >
              <X className="h-6 w-6" strokeWidth={1.8} />
            </button>

            <div className="relative p-8 text-center md:p-14">
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center bg-[#eeeeee] text-black">
                <Check className="h-9 w-9" strokeWidth={1.6} />
              </div>

              <div className="mb-10">
                <h2
                  id="auction-bid-confirmed-title"
                  className="text-3xl font-bold uppercase tracking-[0.1em] text-black md:text-4xl"
                  style={headlineFont}
                >
                  Bid Confirmed
                </h2>
                <p className="text-black/58 mx-auto mt-4 max-w-sm text-sm leading-7 md:text-base">
                  Backend auction state confirms your wallet is the current leading bidder.
                </p>
              </div>

              <div className="mb-10 flex flex-col items-center bg-[#f3f3f3] px-6 py-8">
                <p
                  className="text-black/48 mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={headlineFont}
                >
                  Transaction Amount
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-black md:text-6xl" style={headlineFont}>
                    {formatEthDisplay(committedBidValue)}
                  </span>
                  <span className="text-black/48 text-xl font-medium" style={headlineFont}>
                    ETH
                  </span>
                </div>
              </div>

              <div className="border-black/8 mb-10 flex items-center justify-center gap-4 border-y py-6">
                <div className="relative h-12 w-12 overflow-hidden bg-neutral-200">
                  <Image src={imageSrc} alt={imageAlt} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 text-left">
                  <p
                    className="text-black/48 text-[11px] uppercase tracking-[0.1em]"
                    style={headlineFont}
                  >
                    Artwork
                  </p>
                  <p
                    className="mt-1 truncate text-sm font-bold uppercase tracking-[0.12em] text-black"
                    style={headlineFont}
                    title={title}
                  >
                    {title}
                  </p>
                  <p className="text-black/42 mt-1 font-mono text-[11px]">
                    {formatTransactionHash(transactionHash)}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                {onViewOrderStatus ? (
                  <button
                    type="button"
                    onClick={onViewOrderStatus}
                    className="inline-flex min-h-[60px] w-full items-center justify-center bg-black px-8 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#5f5e5e]"
                    style={headlineFont}
                  >
                    View Order Status
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-[60px] w-full items-center justify-center bg-black px-8 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#5f5e5e]"
                    style={headlineFont}
                  >
                    Close
                  </button>
                )}
                {onViewOrderStatus ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-black/58 inline-flex w-full items-center justify-center py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition hover:text-black"
                    style={headlineFont}
                  >
                    Stay Here
                  </button>
                ) : null}
                <a
                  href={getTransactionUrl(transactionHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-black/58 inline-flex w-full items-center justify-center py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition hover:text-black"
                  style={headlineFont}
                >
                  View Transaction
                </a>
              </div>

              <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b border-r border-black/15 opacity-30" />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
