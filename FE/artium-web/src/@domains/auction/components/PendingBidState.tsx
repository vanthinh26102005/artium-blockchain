'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { Clock3, X } from 'lucide-react'
import { type CSSProperties } from 'react'
import { WALLET_TARGET_CHAIN } from '@domains/auth/constants/wallet'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
} from '@shared/components/ui/dialog'

type PendingBidStateProps = {
  isOpen: boolean
  title: string
  imageSrc: string
  imageAlt: string
  committedBidValue: number
  transactionHash: string
  onClose: () => void
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const formatTransactionHash = (value: string) => `${value.slice(0, 7)}...${value.slice(-4)}`

const formatEthDisplay = (value: number) => `${value.toFixed(2)} ETH`

const getTransactionUrl = (transactionHash: string) =>
  `${WALLET_TARGET_CHAIN.blockExplorerUrl.replace(/\/$/, '')}/tx/${encodeURIComponent(transactionHash)}`

export const PendingBidState = ({
  isOpen,
  title,
  imageSrc,
  imageAlt,
  committedBidValue,
  transactionHash,
  onClose,
}: PendingBidStateProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/10 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-labelledby="auction-bid-pending-title"
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative w-full max-w-xl overflow-hidden bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 left-0 h-1 w-full bg-black" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/60 transition hover:text-black md:top-6 md:right-6"
              aria-label="Close pending bid panel"
            >
              <X className="h-6 w-6" strokeWidth={1.8} />
            </button>

            <div className="relative p-8 text-center md:p-14">
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center bg-[#eeeeee] text-black">
                <Clock3 className="h-8 w-8 animate-pulse" strokeWidth={1.8} />
              </div>

              <div className="mb-10">
                <h2
                  id="auction-bid-pending-title"
                  className="text-3xl font-bold tracking-[0.1em] text-black uppercase md:text-4xl"
                  style={headlineFont}
                >
                  Pending Confirmation
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-black/58 md:text-base">
                  Your bid transaction is confirmed on-chain. Artium is waiting for the backend
                  listener to index the order.
                </p>
              </div>

              <div className="mb-10 bg-[#f3f3f3] px-6 py-7 md:px-8">
                <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <span
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Status
                  </span>
                  <span
                    className="text-[11px] font-bold tracking-[0.14em] text-black uppercase"
                    style={headlineFont}
                  >
                    Transaction Submitted
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-black/10 py-4">
                  <span
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Committed Amount
                  </span>
                  <span className="text-xl text-black" style={headlineFont}>
                    {formatEthDisplay(committedBidValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-4">
                  <span
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Transaction Hash
                  </span>
                  <span className="font-mono text-xs text-black/72">
                    {formatTransactionHash(transactionHash)}
                  </span>
                </div>
              </div>

              <div className="mb-10 flex items-center justify-center gap-4 border-y border-black/8 py-6">
                <div className="relative h-12 w-12 overflow-hidden bg-neutral-200">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <span
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Artwork
                  </span>
                  <p
                    className="mt-1 truncate text-sm font-bold tracking-[0.12em] text-black uppercase"
                    style={headlineFont}
                    title={title}
                  >
                    {title}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[60px] w-full items-center justify-center bg-black px-8 text-center text-[12px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-[#5f5e5e]"
                  style={headlineFont}
                >
                  Close
                </button>
                <a
                  href={getTransactionUrl(transactionHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center py-2 text-[11px] font-bold tracking-[0.15em] text-black/58 uppercase transition hover:text-black"
                  style={headlineFont}
                >
                  View Transaction
                </a>
              </div>

              <div className="pointer-events-none absolute right-0 bottom-0 h-8 w-8 border-r border-b border-black/15 opacity-30" />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
