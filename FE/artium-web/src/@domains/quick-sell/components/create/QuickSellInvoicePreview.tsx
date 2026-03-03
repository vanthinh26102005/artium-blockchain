// icons
import { CreditCard, ShieldCheck } from 'lucide-react'

// @domains - quick-sell
import type { QuickSellInvoiceDraft, InvoiceTotals } from '../../types/quickSellDraft'
import { formatMoney } from '../../utils/pricing'
import { QuickSellOrderSummary } from './QuickSellOrderSummary'

type QuickSellInvoicePreviewProps = {
    draft: QuickSellInvoiceDraft
    totals: InvoiceTotals
}

export const QuickSellInvoicePreview = ({
    draft,
    totals,
}: QuickSellInvoicePreviewProps) => {
    // -- derived --
    const hasItems = draft.items.length > 0
    const invoiceNumber = 'Preview'

    // -- render --
    return (
        <div className="w-full max-w-[900px]">
            <div className="mb-4 text-center">
                <span className="text-[11px] uppercase tracking-widest text-[#989898]">
                    This is what your buyer will see
                </span>
            </div>

            <div className="rounded-[20px] bg-white p-8 shadow-sm border border-[#E5E5E5]">
                <h2 className="mb-1 text-[22px] font-bold text-[#191414]">
                    Invoice #{invoiceNumber}
                </h2>
                <p className="mb-6 text-[12px] text-[#989898]">SECURE CHECKOUT</p>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column: FROM, Item, ORDER SUMMARY, Trust Badge */}
                    <div className="col-span-5 space-y-5">
                        {/* FROM */}
                        <div className="rounded-[12px] border border-[#E5E5E5] p-5">
                            <span className="mb-3 block text-[13px] font-extrabold uppercase tracking-wider text-[#191414]">FROM</span>
                            <div className="space-y-1">
                                <p className="text-[14px] font-bold text-[#191414]">Thinh Van</p>
                                <p className="text-[13px] text-[#595959]">vanvanthinh.261005@gmail.com</p>
                                <p className="text-[13px] text-[#595959] leading-snug">
                                    12321, Middlebrook Road, 123123, Ashburn,
                                    Maryland, Afghanistan, 70000
                                </p>
                            </div>
                        </div>

                        {/* TO (Buyer Info) */}
                        {(draft.buyer.name || draft.buyer.email) && (
                            <div className="rounded-[12px] border border-[#E5E5E5] p-5">
                                <span className="mb-3 block text-[13px] font-extrabold uppercase tracking-wider text-[#191414]">TO</span>
                                <div className="space-y-1">
                                    {draft.buyer.name && (
                                        <p className="text-[14px] font-bold text-[#191414]">{draft.buyer.name}</p>
                                    )}
                                    {draft.buyer.email && (
                                        <p className="text-[13px] text-[#595959]">{draft.buyer.email}</p>
                                    )}
                                    {draft.buyer.message && (
                                        <p className="mt-2 text-[13px] italic text-[#595959]">"{draft.buyer.message}"</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Items List */}
                        {hasItems ? (
                            <div className="space-y-4">
                                {draft.items.map((item, i) => (
                                    <div key={item.id || i} className="rounded-[12px] border border-[#E5E5E5] p-4 flex gap-4 bg-white">
                                        {/* Image */}
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5] border border-[#E5E5E5]">
                                            {(item.type === 'artwork' && item.artworkImageUrl) ? (
                                                <img
                                                    src={item.artworkImageUrl}
                                                    alt={item.artworkName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[8px] text-[#989898] text-center p-1">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-[14px] font-bold text-[#191414] truncate">
                                                {item.type === 'artwork' ? item.artworkName : item.title}
                                            </h4>
                                            <p className="text-[12px] text-[#595959]">
                                                {item.type === 'artwork' ? 'Artwork' : 'Custom Item'}
                                                {item.quantity > 1 && ` x${item.quantity}`}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[14px] font-semibold text-[#191414]">
                                                    {formatMoney(item.price * item.quantity * (1 - item.discountPercent / 100))}
                                                </span>
                                                {item.discountPercent > 0 && (
                                                    <span className="text-[12px] text-[#989898] line-through">
                                                        {formatMoney(item.price * item.quantity)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Item Preview Placeholder (Show if no items) */
                            <div className="rounded-[12px] border border-[#E5E5E5] p-5">
                                <div className="flex gap-4">
                                    <div className="h-24 w-24 shrink-0 rounded-lg bg-[#F5F5F5]" />
                                    <div className="flex-1 space-y-2 pt-2">
                                        <div className="h-3 w-3/4 rounded bg-[#E5E5E5]" />
                                        <div className="h-3 w-1/2 rounded bg-[#E5E5E5]" />
                                        <div className="h-3 w-1/3 rounded bg-[#E5E5E5]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="rounded-[12px] border border-[#E5E5E5] p-5">
                            <span className="mb-4 block text-[13px] font-extrabold uppercase tracking-wider text-[#191414]">ORDER SUMMARY</span>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[14px]">
                                    <span className="text-[#191414]">Subtotal</span>
                                    <span className="font-semibold text-[#191414]">{formatMoney(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[20px] pt-3 border-t border-[#E5E5E5]">
                                    <span className="font-bold text-[#191414]">Total</span>
                                    <span className="font-bold text-[#191414]">{formatMoney(totals.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badge */}
                        <div className="rounded-[12px] border border-[#E5E5E5] p-5 flex gap-3">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-[#989898] mt-0.5" />
                            <div>
                                <h4 className="text-[13px] font-bold text-[#191414]">Your Trust is Our Priority</h4>
                                <p className="mt-1 text-[11px] text-[#595959] leading-relaxed">
                                    Orders shipped with Artium are eligible for 100% money-back guarantee, easy returns within a 48 hour window. All purchases include digital certificates of authenticity. Learn more in our <span className="underline cursor-pointer">terms of service</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment Method Only */}
                    <div className="col-span-7">
                        {/* Payment Method */}
                        <div className="rounded-[12px] border border-[#E5E5E5] p-5">
                            <span className="mb-4 block text-[13px] font-extrabold uppercase tracking-wider text-[#191414]">PAYMENT METHOD</span>

                            {/* Tabs */}
                            <div className="mb-5 flex gap-2">
                                <button className="flex min-w-[80px] flex-col items-center justify-center gap-1.5 rounded-[8px] border-2 border-blue-600 bg-blue-50 py-3 px-4 text-blue-600">
                                    <CreditCard className="h-5 w-5" />
                                    <span className="text-[10px] font-bold">CARD</span>
                                </button>
                                <button className="flex min-w-[80px] flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#E5E5E5] bg-white py-3 px-4 text-[#989898]">
                                    <img src="/images/pay/Google_Pay_Logo.png" alt="Google Pay" className="h-5 w-auto object-contain" />
                                    <span className="text-[10px] font-bold">GOOGLE PAY</span>
                                </button>
                                <button className="flex min-w-[80px] flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#E5E5E5] bg-white py-3 px-4 text-[#989898]">
                                    <img src="/images/pay/Apple_Pay_logo.png" alt="Apple Pay" className="h-5 w-auto object-contain" />
                                    <span className="text-[10px] font-bold">APPLE PAY</span>
                                </button>
                                <button className="flex min-w-[80px] flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#E5E5E5] bg-white py-3 px-4 text-[#989898]">
                                    <div className="h-5 w-5 rounded bg-pink-500 flex items-center justify-center text-white text-[10px] font-bold">K</div>
                                    <span className="text-[10px] font-bold">KLARNA</span>
                                </button>
                            </div>

                            {/* Card Form */}
                            <div className="space-y-4 rounded-[12px] border border-[#E5E5E5] p-5 bg-[#FDFDFD]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4 text-[#191414]" />
                                    <span className="text-[12px] font-bold text-[#191414]">CARD</span>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold text-[#191414]">CARD NUMBER <span className="text-red-500">*</span></label>
                                    <div className="h-[44px] w-full rounded-lg bg-[#E5E5E5] opacity-60 flex items-center px-4 text-[14px] text-[#595959]">
                                        1234 1234 1234 1234
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-bold text-[#191414]">EXPIRATION <span className="text-red-500">*</span></label>
                                        <div className="h-[44px] w-full rounded-lg bg-[#E5E5E5] opacity-60 flex items-center px-4 text-[14px] text-[#595959]">
                                            MM/YY
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-bold text-[#191414]">CVC <span className="text-red-500">*</span></label>
                                        <div className="h-[44px] w-full rounded-lg bg-[#E5E5E5] opacity-60 flex items-center px-4 text-[14px] text-[#595959]">
                                            000
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold text-[#191414]">COUNTRY <span className="text-red-500">*</span></label>
                                    <div className="h-[44px] w-full rounded-lg bg-[#E5E5E5] opacity-60 flex items-center px-4 text-[14px] text-[#595959]">
                                        Select Country
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[#E5E5E5]">
                    <span className="text-[11px] text-[#989898]">Powered by</span>
                    <span className="text-[13px] font-bold text-[#191414]">Artium</span>
                </div>
            </div>
        </div>
    )
}
