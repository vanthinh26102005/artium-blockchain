'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { Check, X } from 'lucide-react'
import { type CSSProperties } from 'react'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
} from '@shared/components/ui/dialog'

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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const formatTransactionHash = (value: string) => `${value.slice(0, 7)}...${value.slice(-4)}`

const formatEthDisplay = (value: number) => value.toFixed(2)

const getTransactionUrl = (transactionHash: string) =>
  `https://etherscan.io/tx/${encodeURIComponent(transactionHash)}`

export const ConfirmedBidState = ({
  isOpen,
  title,
  imageSrc,
  imageAlt,
  committedBidValue,
  transactionHash,
  onClose,
  onViewOrderStatus,
}: ConfirmedBidStateProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/10 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-labelledby="auction-bid-confirmed-title"
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative w-full max-w-xl overflow-hidden bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 left-0 h-1 w-full bg-black" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/60 transition hover:text-black md:top-6 md:right-6"
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
                  className="text-3xl font-bold tracking-[0.1em] text-black uppercase md:text-4xl"
                  style={headlineFont}
                >
                  Bid Confirmed
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-black/58 md:text-base">
                  Your bid has been successfully placed and recorded on the blockchain.
                </p>
              </div>

              <div className="mb-10 flex flex-col items-center bg-[#f3f3f3] px-6 py-8">
                <p
                  className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-black/48 uppercase"
                  style={headlineFont}
                >
                  Transaction Amount
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-black md:text-6xl" style={headlineFont}>
                    {formatEthDisplay(committedBidValue)}
                  </span>
                  <span className="text-xl font-medium text-black/48" style={headlineFont}>
                    ETH
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
                  <p
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Artwork
                  </p>
                  <p
                    className="mt-1 truncate text-sm font-bold tracking-[0.12em] text-black uppercase"
                    style={headlineFont}
                    title={title}
                  >
                    {title}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-black/42">
                    {formatTransactionHash(transactionHash)}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                {onViewOrderStatus ? (
                  <button
                    type="button"
                    onClick={onViewOrderStatus}
                    className="inline-flex min-h-[60px] w-full items-center justify-center bg-black px-8 text-center text-[12px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-[#5f5e5e]"
                    style={headlineFont}
                  >
                    View Order Status
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-[60px] w-full items-center justify-center bg-black px-8 text-center text-[12px] font-bold tracking-[0.2em] text-white uppercase transition hover:bg-[#5f5e5e]"
                    style={headlineFont}
                  >
                    Done
                  </button>
                )}
                {onViewOrderStatus ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full items-center justify-center py-2 text-[11px] font-bold tracking-[0.15em] text-black/58 uppercase transition hover:text-black"
                    style={headlineFont}
                  >
                    Stay Here
                  </button>
                ) : null}
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
