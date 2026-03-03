// react
import { useState, useCallback } from 'react'

// icons
import { Info, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

// @shared - components
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'

// types
import type { CheckoutBuyerAddress } from '../../types/checkoutTypes'
import type { ReactNode } from 'react'

type QuickSellCheckoutMainContentProps = {
    address: CheckoutBuyerAddress
    onAddressChange: (address: CheckoutBuyerAddress) => void
    errors?: Record<string, string>
    paymentElement?: ReactNode
    paymentPlaceholder?: ReactNode
    paymentError?: string | null
}

type DeliveryMethod = 'pickup' | 'Artium' | 'invoice_only'

export const QuickSellCheckoutMainContent = ({
    address,
    onAddressChange,
    errors = {},
    paymentElement,
    paymentPlaceholder,
    paymentError,
}: QuickSellCheckoutMainContentProps) => {
    // -- state --
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup')
    const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(true)
    const [isWireTransferOpen, setIsWireTransferOpen] = useState(false)
    const [paymentTab, setPaymentTab] = useState<'card' | 'google' | 'klarna'>('card')

    // -- handlers --
    const handleFieldChange = useCallback(
        (field: keyof CheckoutBuyerAddress, value: string) => {
            onAddressChange({ ...address, [field]: value })
        },
        [address, onAddressChange],
    )

    const cardClass = "rounded-[24px] bg-white p-6 border border-black/5 md:p-8"
    const labelClass = "mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#191414]"
    const inputClass = "h-[52px] rounded-xl border border-[#E5E5E5] bg-[#FCFCFC] px-4 text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#191414] focus:bg-white focus:ring-0 transition-colors"

    return (
        <div className="flex flex-col gap-4">
            {/* IN-PERSON PAYMENT */}
            <section className={cardClass}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-3">
                    IN-PERSON PAYMENT
                </h3>
                <p className="text-[13px] text-[#595959] mb-4 font-medium">
                    Use this option if the buyer is present and ready to pay using Tap to Pay.
                </p>
                <div className="flex items-center gap-3 rounded-[16px] bg-[#F5F5F5] p-4">
                    <Info className="h-4 w-4 text-[#989898] shrink-0" />
                    <p className="text-[12px] text-[#595959] font-medium">
                        To use Tap to Pay, open this page in the Artium app on a mobile devices{' '}
                        <span className="text-blue-600 underline cursor-pointer hover:text-blue-700">(see list of supported devices)</span>
                    </p>
                </div>
            </section>

            {/* CONTACT INFORMATION */}
            <section className={cardClass}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-6">
                    CONTACT INFORMATION
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <Label className={labelClass}>FIRST NAME</Label>
                        <Input
                            type="text"
                            value={address.firstName || ''}
                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                            placeholder=""
                            className={inputClass}
                        />
                        <div className="mt-1.5 text-right text-[10px] font-medium text-[#989898]">2/50 characters</div>
                    </div>
                    <div>
                        <Label className={labelClass}>LAST NAME</Label>
                        <Input
                            type="text"
                            value={address.lastName || ''}
                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                            className={inputClass}
                        />
                        <div className="mt-1.5 text-right text-[10px] font-medium text-[#989898]">0/50 characters</div>
                    </div>
                </div>

                <div className="mt-6">
                    <Label className={labelClass}>EMAIL ADDRESS</Label>
                    <Input
                        type="email"
                        value={address.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder=""
                        className={inputClass}
                    />
                </div>

                <div className="mt-6">
                    <Label className={labelClass}>PHONE NUMBER</Label>
                    <div className="flex gap-3">
                        <div className="flex w-[100px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E5E5E5] bg-[#FCFCFC]">
                            <span className="text-[16px]">🇺🇸</span>
                            <span className="text-[14px] font-bold text-[#191414]">+1</span>
                        </div>
                        <Input
                            type="tel"
                            value={address.phone || ''}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            placeholder="201-555-0123"
                            className={`flex-1 ${inputClass}`}
                        />
                    </div>
                    <p className="mt-2 text-[11px] text-[#989898]">
                        We will only use your phone number for delivery purposes.
                    </p>
                </div>
            </section>

            {/* DELIVERY METHOD */}
            <section className={cardClass}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-4">
                    DELIVERY METHOD
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`group relative h-[52px] rounded-full border transition-all ${deliveryMethod === 'pickup'
                            ? 'border-blue-600 bg-blue-50/50 text-blue-600 z-10'
                            : 'border-[#E5E5E5] bg-white text-[#595959] hover:border-[#989898]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2.5">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${deliveryMethod === 'pickup' ? 'border-blue-600' : 'border-[#D1D1D1] group-hover:border-[#989898]'
                                }`}>
                                {deliveryMethod === 'pickup' && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                            </div>
                            <span className="text-[13px] font-bold">Pick up / Ship by seller</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('Artium')}
                        className={`group relative h-[52px] rounded-full border transition-all ${deliveryMethod === 'Artium'
                            ? 'border-blue-600 bg-blue-50/50 text-blue-600 z-10'
                            : 'border-[#E5E5E5] bg-white text-[#595959] hover:border-[#989898]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2.5">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${deliveryMethod === 'Artium' ? 'border-blue-600' : 'border-[#D1D1D1] group-hover:border-[#989898]'
                                }`}>
                                {deliveryMethod === 'Artium' && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                            </div>
                            <span className="text-[13px] font-bold">Ship by Artium</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('invoice_only')}
                        className={`group relative h-[52px] rounded-full border transition-all ${deliveryMethod === 'invoice_only'
                            ? 'border-blue-600 bg-blue-50/50 text-blue-600 z-10'
                            : 'border-[#E5E5E5] bg-white text-[#595959] hover:border-[#989898]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2.5">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${deliveryMethod === 'invoice_only' ? 'border-blue-600' : 'border-[#D1D1D1] group-hover:border-[#989898]'
                                }`}>
                                {deliveryMethod === 'invoice_only' && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                            </div>
                            <span className="text-[13px] font-bold">Invoice Only</span>
                        </div>
                    </button>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-[#F5F5F5] p-4">
                    <Info className="h-4 w-4 text-[#989898] shrink-0" />
                    <p className="text-[12px] text-[#595959] font-medium">
                        Once your payment is processed, you will receive an email to arrange the pick up, drop off, or coordinate their own shipping method of your artwork.
                    </p>
                </div>
            </section>

            {/* PICK UP / SHIP ADDRESS */}
            <section className={cardClass}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898] mb-6">
                    PICK UP / SHIP ADDRESS
                </h3>

                <div className="space-y-6">
                    <div>
                        <Label className={labelClass}>ADDRESS LINE 1</Label>
                        <Input
                            type="text"
                            value={address.addressLine1 || ''}
                            onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
                            placeholder="Start typing your address..."
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <Label className={labelClass}>ADDRESS LINE 2 <span className="font-medium text-[#989898] normal-case tracking-normal">(optional)</span></Label>
                        <Input
                            type="text"
                            value={address.addressLine2 || ''}
                            onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
                            placeholder="Apartment, suite, building number"
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <Label className={labelClass}>CITY</Label>
                            <Input
                                type="text"
                                value={address.city || ''}
                                onChange={(e) => handleFieldChange('city', e.target.value)}
                                placeholder="Enter City"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <Label className={labelClass}>STATE / DISTRICT / PROVINCE</Label>
                            <Input
                                type="text"
                                value={address.state || ''}
                                onChange={(e) => handleFieldChange('state', e.target.value)}
                                placeholder="Enter State/Province/Region"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <Label className={labelClass}>COUNTRY</Label>
                            <div className="relative">
                                <select
                                    value={address.country || ''}
                                    onChange={(e) => handleFieldChange('country', e.target.value)}
                                    className={`w-full appearance-none ${inputClass} pr-10`}
                                >
                                    <option value="">Enter Country</option>
                                    <option value="US">United States</option>
                                    <option value="VN">Việt Nam</option>
                                    <option value="CA">Canada</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#989898] pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <Label className={labelClass}>POSTAL/ZIP CODE</Label>
                            <Input
                                type="text"
                                value={address.postalCode || ''}
                                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                                placeholder="Enter Postal Code/ZIP"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SALES TAX */}
            <section className={cardClass}>
                <div className="flex items-center gap-1 mb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">SALES TAX</h3>
                    <span className="text-red-500 text-[11px]">*</span>
                </div>
                <p className="text-[13px] text-[#595959] mb-6 font-medium">
                    Sales tax is based on the pickup or event ZIP code. You can also manage tax manually. Currently applies to U.S. transactions only.{' '}
                    <span className="text-blue-600 underline cursor-pointer hover:text-blue-700">Learn more</span>.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-[#191414]">ZIPCODE</Label>
                            <span className="text-red-500 text-[11px]">*</span>
                        </div>
                        <Input
                            type="text"
                            value={address.postalCode || ''}
                            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                            placeholder=""
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-[#191414]">SALES TAX</Label>
                            <span className="text-red-500 text-[11px]">*</span>
                        </div>
                        <div className="relative">
                            <Input
                                type="text"
                                value="6"
                                readOnly
                                className={inputClass}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#989898]">%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="rounded-[24px] bg-white border border-black/5 overflow-hidden">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898] p-6 pb-4 md:p-8 md:pb-4">
                    PAYMENT METHOD
                </h3>

                {/* Card & Online Payment Accordion */}
                <div className="border-t border-[#E5E5E5] bg-white">
                    <button
                        type="button"
                        onClick={() => setIsCardPaymentOpen(!isCardPaymentOpen)}
                        className="flex w-full items-center justify-between px-6 py-5 hover:bg-[#FAFAFA] transition md:px-8"
                    >
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-[#191414]" />
                            <span className="text-[14px] font-bold text-[#191414]">CARD & ONLINE PAYMENT</span>
                        </div>
                        {isCardPaymentOpen ? (
                            <ChevronUp className="h-5 w-5 text-[#989898]" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-[#989898]" />
                        )}
                    </button>

                    {isCardPaymentOpen && (
                        <div className="px-6 pb-6 md:px-8 md:pb-8">
                            {/* Payment Tabs */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setPaymentTab('card')}
                                    className={`h-[64px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentTab === 'card'
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-[#E5E5E5] bg-white hover:border-[#989898]'
                                        }`}
                                >
                                    <CreditCard className={`h-5 w-5 ${paymentTab === 'card' ? 'text-blue-600' : 'text-[#191414]'}`} />
                                    <span className={`text-[12px] font-medium ${paymentTab === 'card' ? 'text-blue-600' : 'text-[#595959]'}`}>Thẻ</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentTab('google')}
                                    className={`h-[64px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentTab === 'google'
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-[#E5E5E5] bg-white hover:border-[#989898]'
                                        }`}
                                >
                                    <img src="/images/pay/Google_Pay_Logo.png" alt="Google Pay" className="h-4 object-contain" />
                                    <span className="text-[12px] font-medium text-[#595959]">Google Pay</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentTab('klarna')}
                                    className={`h-[64px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentTab === 'klarna'
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-[#E5E5E5] bg-white hover:border-[#989898]'
                                        }`}
                                >
                                    <span className="text-[16px] font-bold text-pink-500 leading-none">K.</span>
                                    <span className="text-[12px] font-medium text-[#595959]">Klarna</span>
                                </button>
                            </div>

                            {/* Card Form */}
                            {paymentTab === 'card' && (
                                <div className="space-y-4">
                                    {paymentElement ? (
                                        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
                                            {paymentElement}
                                        </div>
                                    ) : (
                                        paymentPlaceholder ?? (
                                            <div className="grid grid-cols-[1fr_120px] gap-4 md:grid-cols-[1fr_160px_100px]">
                                                <div className="col-span-2 md:col-span-1">
                                                    <Label className={labelClass}>SỐ THẺ</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="text"
                                                            placeholder="1234 1234 1234 1234"
                                                            className={inputClass}
                                                            disabled
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-50">
                                                            <div className="h-5 w-8 bg-gray-200 rounded"></div>
                                                            <div className="h-5 w-8 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className={labelClass}>NGÀY HẾT HẠN</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="MM / YY"
                                                        className={inputClass}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <Label className={labelClass}>MÃ BẢO MẬT</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="CVC"
                                                        className={inputClass}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}

                                    <div>
                                        <Label className={labelClass}>QUỐC GIA</Label>
                                        <div className="relative">
                                            <select className={`w-full appearance-none ${inputClass} pr-10`}>
                                                <option value="VN">Việt Nam</option>
                                                <option value="US">United States</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#989898] pointer-events-none" />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-[#595959] leading-relaxed">
                                        Khi cung cấp thông tin thẻ, bạn cho phép Artium tính phí thẻ của bạn cho các khoản thanh toán trong tương lai theo các điều khoản của họ.
                                    </p>

                                    {paymentError && (
                                        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-[12px] text-red-600">
                                            {paymentError}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Wire Transfer Accordion */}
                <div className="border-t border-[#E5E5E5] bg-white">
                    <button
                        type="button"
                        onClick={() => setIsWireTransferOpen(!isWireTransferOpen)}
                        className="flex w-full items-center justify-between px-6 py-5 hover:bg-[#FAFAFA] transition md:px-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center">
                                <svg className="h-full w-full text-[#191414]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <span className="text-[14px] font-bold text-[#191414]">WIRE TRANSFER</span>
                        </div>
                        {isWireTransferOpen ? (
                            <ChevronUp className="h-5 w-5 text-[#989898]" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-[#989898]" />
                        )}
                    </button>

                    {isWireTransferOpen && (
                        <div className="px-6 pb-6 md:px-8 md:pb-8">
                            <p className="mb-6 text-[13px] leading-relaxed text-[#595959]">
                                Transfer funds directly to our account using the details below. Once you've made payment, contact{' '}
                                <a href="mailto:sales@Artium.com" className="text-blue-600 underline hover:text-blue-700">
                                    sales@Artium.com
                                </a>{' '}
                                with your proof of payment. Processing times may take up to five business days.
                            </p>

                            <div className="rounded-xl bg-[#F9FAFB] p-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Bank Name</span>
                                        <span className="text-[13px] font-bold text-[#191414]">Silicon Valley Bank (SVB)</span>
                                    </div>
                                    <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Routing Number</span>
                                        <span className="text-[13px] font-bold text-[#191414]">121140399</span>
                                    </div>
                                    <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Account Number</span>
                                        <span className="text-[13px] font-bold text-[#191414]">3304399019</span>
                                    </div>
                                    <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Swift Code</span>
                                        <span className="text-[13px] font-bold text-[#191414]">SVBKUS6S</span>
                                    </div>
                                    <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Account Name</span>
                                        <span className="text-[13px] font-bold text-[#191414]">Artium Inc</span>
                                    </div>
                                    <div className="flex flex-col justify-between gap-1 pt-2 md:flex-row md:items-start">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898] shrink-0">General Bank Reference Address</span>
                                        <span className="text-[13px] font-bold text-[#191414] text-right max-w-[400px]">
                                            SVB, A DIVISION OF FIRST CITIZENS BANK 3003 TASMAN DRIVE, SANTA CLARA, CA 95054, USA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer text */}
            <div className="text-center py-6">
                <p className="text-[12px] font-medium text-[#989898]">
                    Powered by <span className="font-bold text-[#191414]">Artium</span>
                </p>
            </div>
        </div>
    )
}
