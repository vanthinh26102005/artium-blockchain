// react
import { ReactNode } from 'react'

// icons
import { Shield, ExternalLink } from 'lucide-react'

// types
import type { CheckoutInvoice } from '../../types/checkoutTypes'
import { formatMoney } from '../../utils/pricing'

type QuickSellCheckoutSidebarProps = {
    invoice: CheckoutInvoice
    totals: {
        subtotal: number
        discountTotal: number
        shipping: number
        taxPercent: number
        tax: number
        total: number
    }
}

export const QuickSellCheckoutSidebar = ({
    invoice,
    totals,
}: QuickSellCheckoutSidebarProps) => {
    // Get first artwork item for display
    const artworkItem = invoice.items.find(item => item.type === 'artwork')
    const artistName = invoice.seller?.name || 'Artist'
    const artistEmail = invoice.seller?.email || ''
    const buyerName = invoice.buyer?.name || 'Buyer'
    const buyerEmail = invoice.buyer?.email || ''

    const cardClass = "rounded-[24px] bg-white p-6 border border-black/5"

    return (
        <div className="flex flex-col gap-4">
            {/* FROM Section */}
            <div className={cardClass}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-3">FROM</p>
                <p className="text-[15px] font-bold text-[#191414]">{artistName}</p>
                {artistEmail && (
                    <p className="mt-1 text-[13px] text-[#595959]">{artistEmail}</p>
                )}
            </div>

            {/* TO Section */}
            <div className={cardClass}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-3">TO</p>
                <p className="text-[15px] font-bold text-[#191414]">{buyerName}</p>
                {buyerEmail && (
                    <p className="mt-1 text-[13px] text-[#595959]">{buyerEmail}</p>
                )}
            </div>

            {/* Artwork Item */}
            {artworkItem && (
                <div className={cardClass}>
                    <div className="flex gap-4">
                        {/* Artwork Image */}
                        <div className="w-[100px] h-[100px] shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                            {artworkItem.type === 'artwork' && artworkItem.artworkImageUrl ? (
                                <img
                                    src={artworkItem.artworkImageUrl}
                                    alt={artworkItem.artworkName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#989898]">
                                    🖼
                                </div>
                            )}
                        </div>

                        {/* Artwork Info */}
                        <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-start gap-1">
                                <h4 className="text-[15px] font-bold text-[#191414] truncate leading-tight">
                                    {artworkItem.type === 'artwork' ? artworkItem.artworkName : artworkItem.title}
                                </h4>
                                <ExternalLink className="h-3.5 w-3.5 text-[#989898] shrink-0 translate-y-0.5" />
                            </div>
                            {artworkItem.type === 'artwork' && artworkItem.artistName && (
                                <p className="mt-1 text-[13px] text-[#595959]">{artworkItem.artistName}</p>
                            )}
                            <div className="mt-3 space-y-0.5 text-[12px] text-[#989898]">
                                <p>2000</p>
                                <p>12 × 34 × 56 in</p>
                                <p>oil</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ORDER SUMMARY */}
            <div className={cardClass}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-4">ORDER SUMMARY</p>

                <div className="space-y-3">
                    <div className="flex justify-between text-[14px]">
                        <span className="font-medium text-[#191414]">Subtotal</span>
                        <span className="font-bold text-[#191414] text-right">{formatMoney(totals.subtotal)}</span>
                    </div>

                    {totals.taxPercent > 0 && (
                        <div className="flex justify-between text-[14px]">
                            <span className="font-medium text-[#191414] flex items-center gap-1.5">
                                {totals.taxPercent.toFixed(2)}% Tax
                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#E5E5E5] text-[9px] font-bold text-[#595959]">i</span>
                            </span>
                            <span className="font-bold text-[#191414] text-right">{formatMoney(totals.tax)}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-black/5">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[16px] font-bold text-[#191414]">Total</span>
                        <span className="text-[24px] font-bold text-[#191414]">
                            US{formatMoney(totals.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="rounded-[24px] border border-black/5 bg-[#FAFAFA] p-5">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#989898] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[13px] font-bold text-[#191414]">Your Trust is Our Priority</h4>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[#595959]">
                            Orders shipped with Artium are eligible for 100% money-back guarantee, easy returns within a 48 hour window. All purchase invoices include digital certificates of authenticity. Learn more in our{' '}
                            <span className="font-semibold text-[#191414] underline cursor-pointer hover:text-blue-600">terms of service</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
