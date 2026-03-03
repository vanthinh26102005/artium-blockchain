// react
import { useState } from 'react'

// third-party
import { Bookmark, DollarSign, Eye, Heart, Pencil, Share2, Trash2, X } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogOverlay, DialogPortal, DialogPrimitive } from '@shared/components/ui/dialog'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'

type InventoryArtworkDetailsPanelProps = {
  isOpen: boolean
  artwork: InventoryArtwork | null
  onClose: () => void
}

export const InventoryArtworkDetailsPanel = ({
  isOpen,
  artwork,
  onClose,
}: InventoryArtworkDetailsPanelProps) => {
  // -- state --
  const [activeSection, setActiveSection] = useState<'artwork' | 'creator'>('artwork')

  if (!artwork) {
    return null
  }

  const priceLabel =
    typeof artwork.price === 'number' ? `US$${artwork.price.toLocaleString('en-US')}` : '—'

  const isArtworkSection = activeSection === 'artwork'

  // -- render --
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/40 backdrop-blur-sm data-[state=closed]:duration-200 data-[state=open]:duration-300" />
        <DialogPrimitive.Content
          className="data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right fixed top-0 right-0 z-210 flex h-full w-[99vw] max-w-[1530px] flex-col bg-white shadow-2xl outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-8 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Artwork Information Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="self-start rounded-2xl bg-[#EFEFEF] p-6">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={artwork.thumbnailUrl}
                      alt={artwork.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-10 border-t border-slate-200/70 bg-white py-4 text-base text-slate-600">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-base font-medium text-slate-700"
                    >
                      <Heart className="h-4 w-4" />
                      Like
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-base font-medium text-slate-700"
                    >
                      <Bookmark className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-base font-medium text-slate-700"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase">{artwork.status}</p>
                  <h3 className="mt-2 text-[36px] leading-[44px] font-semibold text-slate-900">
                    {artwork.title}
                  </h3>
                  <p className="mt-2 text-lg text-slate-500">
                    Created and listed by{' '}
                    <span className="font-semibold text-slate-900">{artwork.creatorName}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-lg text-slate-600">
                    <span>oil</span>
                    <span>12 × 34 × 56 in</span>
                    <span className="text-slate-300">/</span>
                    <span>30.48 × 86.36 × 142.24 cm</span>
                    <span className="text-slate-300">/</span>
                    <span>22.68 kg</span>
                    <span className="text-slate-300">/</span>
                    <span>50 lbs</span>
                  </div>
                </div>

                <div>
                  <p className="text-3xl font-semibold text-slate-900">{priceLabel}</p>
                  <p className="mt-2 text-lg text-slate-500">
                    Only {artwork.status === 'Hidden' ? '0' : '7'} available.
                  </p>
                </div>

                <div className="space-y-2 text-lg text-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Unique piece. Only 1 available. Get yours now!</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Includes a Certificate of Authenticity</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-fit rounded-full px-5 py-2.5 text-base font-semibold shadow-sm"
                >
                  <DollarSign className="h-4 w-4" />
                  Quick Sell
                </Button>

                <div className="border-t border-slate-200 pt-4 text-lg text-slate-600">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-400 uppercase">
                    <span>Shipping and taxes</span>
                    <span>^</span>
                  </div>
                  <p className="mt-3">Ships from Ashburn, Maryland</p>
                  <p className="mt-1">Flat 5% fee for domestic, 8% for international</p>
                  <p className="mt-1">Shipped within 7 days in a crate</p>
                  <p className="mt-1">Artium insures your order</p>
                  <button type="button" className="mt-2 text-lg font-medium underline">
                    Learn more
                  </button>
                </div>

                <div className="border-t border-slate-200 pt-4 text-lg text-slate-600">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-400 uppercase">
                    <span>Artium satisfaction guarantee</span>
                    <span>^</span>
                  </div>
                  <p className="mt-3">Secure checkout</p>
                  <p className="mt-1">100% money-back guarantee</p>
                  <p className="mt-1">Authenticity guarantee</p>
                  <button type="button" className="mt-2 text-lg font-medium underline">
                    Learn more
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-center gap-12 text-xl font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveSection('artwork')}
                  className={`pb-2 ${
                    isArtworkSection
                      ? 'border-b-2 border-slate-900 text-slate-900'
                      : 'text-slate-500'
                  }`}
                >
                  About the Artwork
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('creator')}
                  className={`pb-2 ${
                    !isArtworkSection
                      ? 'border-b-2 border-slate-900 text-slate-900'
                      : 'text-slate-500'
                  }`}
                >
                  About the Creator
                </button>
              </div>

              <div className="mt-8 text-lg text-slate-600">
                <p className="text-base font-semibold text-slate-400 uppercase">
                  About the {isArtworkSection ? 'Artwork' : 'Creator'}
                </p>
                <p className="mt-3">
                  {isArtworkSection ? 'jakarta bi loi' : 'Creator details coming soon.'}
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-10 py-6 text-lg">
            <button type="button" className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-4 w-4" />
              Delete artwork
            </button>
            <div className="flex items-center gap-6">
              <button type="button" className="flex items-center gap-2 text-slate-700">
                <Pencil className="h-4 w-4" />
                Edit Artwork
              </button>
              <button type="button" className="flex items-center gap-2 text-slate-700">
                <Eye className="h-4 w-4" />
                Show on Profile
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
