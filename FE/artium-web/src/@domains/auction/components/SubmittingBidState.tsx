'use client'

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
  committedBidValue: number
  onClose: () => void
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const headlineFont = {
  fontFamily: spaceGrotesk.style.fontFamily,
} satisfies CSSProperties

export const SubmittingBidState = ({
  isOpen,
  committedBidValue,
  onClose,
}: SubmittingBidStateProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-white/40 backdrop-blur-xl" />
        <DialogPrimitive.Content
          aria-labelledby="auction-bid-submitting-title"
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 outline-none md:p-8"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative w-full max-w-2xl overflow-hidden bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center text-black/70 transition hover:text-black"
              aria-label="Close submitting bid panel"
            >
              <X className="h-7 w-7" strokeWidth={1.8} />
            </button>

            <div className="absolute top-0 right-0 h-56 w-56 -translate-y-1/3 translate-x-1/3 rounded-full bg-black/[0.04] blur-[80px]" />

            <div className="px-8 py-12 text-center md:px-16 md:py-16">
              <div className="relative mx-auto mb-10 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                <div className="absolute inset-0 rounded-full border-t-2 border-black animate-spin" />
                <LoaderCircle className="h-9 w-9 text-black/70 animate-spin" strokeWidth={1.8} />
              </div>

              <div className="mb-12 space-y-4">
                <span
                  className="inline-block border-b border-black/15 pb-2 text-[11px] tracking-[0.28em] text-black/45 uppercase"
                  style={headlineFont}
                >
                  Status: Submitting
                </span>
                <h2
                  id="auction-bid-submitting-title"
                  className="text-4xl font-bold tracking-tight text-black md:text-5xl"
                  style={headlineFont}
                >
                  Submitting Your Bid
                </h2>
                <p className="mx-auto max-w-md text-sm leading-7 text-black/58">
                  We&apos;re sending your bid request and preparing the on-chain transaction. Keep
                  this window open while submission completes.
                </p>
              </div>

              <div className="mb-12 flex flex-col justify-between gap-8 bg-[#f3f3f3] px-6 py-8 text-left md:flex-row md:items-center md:px-8">
                <div>
                  <span
                    className="mb-2 block text-[10px] tracking-[0.2em] text-black/42 uppercase"
                    style={headlineFont}
                  >
                    Bid Amount
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-black" style={headlineFont}>
                      {committedBidValue.toFixed(2)}
                    </span>
                    <span className="text-lg font-light text-black/55" style={headlineFont}>
                      ETH
                    </span>
                  </div>
                </div>

                <div className="md:text-right">
                  <span
                    className="mb-2 block text-[10px] tracking-[0.2em] text-black/42 uppercase"
                    style={headlineFont}
                  >
                    Submission Step
                  </span>
                  <div className="inline-flex items-center gap-2 border border-black/5 bg-white px-3 py-2">
                    <LoaderCircle className="h-4 w-4 text-black/45 animate-spin" />
                    <span className="text-xs text-black/72">Sending transaction request</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[60px] w-full items-center justify-center bg-black px-8 text-center text-[12px] tracking-[0.2em] text-white uppercase transition hover:bg-black/90"
                style={headlineFont}
              >
                Close Modal
              </button>
              <p
                className="mt-6 text-[10px] tracking-[0.16em] text-black/38 uppercase"
                style={headlineFont}
              >
                Secure transaction powered by Ethereum Mainnet
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
