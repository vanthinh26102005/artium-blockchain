'use client'

import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'
import { LoaderCircle, X } from 'lucide-react'
import { type CSSProperties } from 'react'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
} from '@shared/components/ui/dialog'

type SubmittingBidStateProps = {
  isOpen: boolean
  title: string
  imageSrc: string
  imageAlt: string
  committedBidValue: number
  currentBidValue: number
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

const formatEthDisplay = (value: number) => `${value.toFixed(2)} ETH`

const getEstimatedGasFee = (bidValue: number) =>
  Math.max(0.0018, Math.min(0.0048, bidValue * 0.00017)).toFixed(4)

export const SubmittingBidState = ({
  isOpen,
  title,
  imageSrc,
  imageAlt,
  committedBidValue,
  currentBidValue,
}: SubmittingBidStateProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-black/5 backdrop-blur-md" />
        <DialogPrimitive.Content
          aria-labelledby="auction-bid-submitting-title"
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="relative flex w-full max-w-4xl flex-col overflow-hidden bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)] md:flex-row">
            <button
              type="button"
              disabled
              className="absolute top-6 right-6 z-10 inline-flex h-10 w-10 items-center justify-center text-black/20"
              aria-label="Close submitting bid panel"
            >
              <X className="h-6 w-6" strokeWidth={1.8} />
            </button>

            <div className="relative min-h-[260px] w-full overflow-hidden bg-[#eeeeee] md:w-5/12">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 768px) 34vw, 100vw"
                className="object-cover grayscale opacity-80"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute right-5 bottom-5 left-5">
                <p
                  className="text-[10px] tracking-[0.14em] text-white/78 uppercase"
                  style={headlineFont}
                >
                  {title}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col justify-center gap-10 px-8 py-10 md:w-7/12 md:px-14 md:py-16">
              <div className="space-y-8">
                <div className="space-y-2">
                  <span
                    className="block text-[10px] font-bold tracking-[0.2em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Blockchain Transaction
                  </span>
                  <h2
                    id="auction-bid-submitting-title"
                    className="text-2xl tracking-[0.05em] text-black uppercase"
                    style={headlineFont}
                  >
                    Submitting Your Bid...
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="relative h-px w-full overflow-hidden bg-black/10">
                    <div
                      className="absolute top-0 h-full w-2/5 bg-black"
                      style={{ animation: 'submittingProgress 1.5s infinite ease-in-out' }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="text-[11px] tracking-[0.1em] text-black/40 uppercase"
                      style={headlineFont}
                    >
                      Verifying Wallet
                    </span>
                    <span
                      className="text-[11px] font-bold tracking-[0.1em] text-black uppercase"
                      style={headlineFont}
                    >
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f3f3f3] px-6 py-7 md:px-8">
                <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <span
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Current Bid
                  </span>
                  <span className="text-sm tracking-[0.08em] text-black/60 uppercase" style={headlineFont}>
                    {formatEthDisplay(currentBidValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-black/10 py-4">
                  <span
                    className="text-[11px] tracking-[0.1em] text-black/48 uppercase"
                    style={headlineFont}
                  >
                    Bid Amount
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
                    Est. Gas Fee
                  </span>
                  <span
                    className="text-sm tracking-[0.08em] text-black/45 uppercase"
                    style={headlineFont}
                  >
                    {getEstimatedGasFee(committedBidValue)} ETH
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex min-h-[60px] w-full cursor-wait items-center justify-center gap-3 bg-[#5f5e5e] px-8 text-center text-[12px] tracking-[0.15em] text-white uppercase"
                style={headlineFont}
              >
                <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                <span>Processing...</span>
              </button>

              <p className="mx-auto max-w-[280px] text-center text-[12px] leading-6 text-black/58">
                Please keep this window open while the transaction is being indexed on the
                network.
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
      <style jsx>{`
        @keyframes submittingProgress {
          0% {
            left: -40%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </Dialog>
  )
}
