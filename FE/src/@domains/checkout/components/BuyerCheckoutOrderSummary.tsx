// react
import { useState } from 'react'
import Link from 'next/link'

// icons
import { Shield, Truck, Award, ChevronDown, Info } from 'lucide-react'

// shared
import { Input } from '@shared/components/ui/input'
import { Button } from '@shared/components/ui/button'

// types
import type { ArtworkForCheckout, CheckoutPricing } from '../types/buyerCheckoutTypes'

type BuyerCheckoutOrderSummaryProps = {
    artwork: ArtworkForCheckout
    pricing: CheckoutPricing
    promoCode: string
    onPromoCodeChange: (code: string) => void
    onApplyPromo: () => void
}

export const BuyerCheckoutOrderSummary = ({
    artwork,
    pricing,
    promoCode,
    onPromoCodeChange,
    onApplyPromo,
}: BuyerCheckoutOrderSummaryProps) => {
    const [showPromoInput, setShowPromoInput] = useState(false)

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
                    Order Summary
                </h2>

                {/* Artwork Info */}
                <div className="flex gap-4 mb-6">
                    <div className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                        <img
                            src={artwork.coverUrl}
                            alt={artwork.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/artworks/${artwork.id}`}
                            className="block text-[16px] font-bold text-[#191414] hover:text-[#0066FF] transition truncate"
                        >
                            {artwork.title}
                        </Link>
                        <Link
                            href={`/profile/${artwork.artistId || artwork.artistName.toLowerCase().replace(/\s/g, '')}`}
                            className="text-[14px] text-[#595959] hover:text-[#0066FF] transition"
                        >
                            {artwork.artistName}
                        </Link>
                    </div>
                </div>

                {/* Promo Code */}
                <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                    {!showPromoInput ? (
                        <button
                            onClick={() => setShowPromoInput(true)}
                            className="text-[14px] font-medium text-[#0066FF] hover:underline"
                        >
                            Have a promo code?
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                value={promoCode}
                                onChange={(e) => onPromoCodeChange(e.target.value)}
                                placeholder="Enter code"
                                className="h-[44px] flex-1 rounded-xl border border-[#E5E5E5] bg-white text-[14px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                            />
                            <Button
                                onClick={onApplyPromo}
                                variant="outline"
                                className="h-[44px] rounded-xl border-[#E5E5E5] px-4 font-bold text-[#191414] hover:bg-[#F5F5F5]"
                            >
                                Apply
                            </Button>
                        </div>
                    )}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3 border-t border-[#E5E5E5] pt-4">
                    <div className="flex justify-between text-[14px]">
                        <span className="text-[#595959]">Artwork Price</span>
                        <span className="font-bold text-[#191414]">{formatPrice(pricing.artworkPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[14px]">
                        <div className="flex items-center gap-1 text-[#595959]">
                            <span>Shipping Fee</span>
                            <Info className="h-3.5 w-3.5 text-[#989898]" />
                        </div>
                        <span className="font-bold text-[#191414]">{formatPrice(pricing.shippingFee)}</span>
                    </div>
                    {pricing.discount > 0 && (
                        <div className="flex justify-between text-[14px]">
                            <span className="text-green-600">Discount</span>
                            <span className="font-bold text-green-600">-{formatPrice(pricing.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-[#E5E5E5]">
                        <span className="text-[16px] font-bold text-[#191414]">Total</span>
                        <span className="text-[20px] font-bold text-[#191414]">{formatPrice(pricing.total)}</span>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
                {/* Money Back Guarantee */}
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-[#191414]">100% money-back guarantee</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-[#595959]">
                            Return your purchase for any reason within 48 hours after delivery. The buyer is responsible for all return shipping costs.
                        </p>
                    </div>
                </div>

                {/* Shipping */}
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <Truck className="h-5 w-5 text-[#0066FF]" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-[#191414]">Artium offers insured, flat-rate shipping</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-[#595959]">
                            Artium insures your order. Shipping fee is 5% for domestic, 8% for international.{' '}
                            <Link href="/help/shipping" className="text-[#0066FF] hover:underline">
                                Learn more
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Certificate */}
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-[#191414]">Certificate of Authenticity Included</h4>
                        <p className="mt-1 text-[13px] leading-relaxed text-[#595959]">
                            All artworks are authenticated by the Artium team. You will receive a certificate of authenticity from the artist.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
