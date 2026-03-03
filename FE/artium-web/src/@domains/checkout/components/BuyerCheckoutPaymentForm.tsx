// react
import { useState } from 'react'

// icons
import { CreditCard, ChevronDown, ChevronUp, Zap } from 'lucide-react'

// shared
import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

type PaymentMethodType = 'card' | 'google_pay' | 'klarna'

type BuyerCheckoutPaymentFormProps = {
    onCardChange?: (cardData: CardData) => void
    selectedCountry: string
    onCountryChange: (country: string) => void
}

export type CardData = {
    cardNumber: string
    expiryDate: string
    cvc: string
}

export const BuyerCheckoutPaymentForm = ({
    onCardChange,
    selectedCountry,
    onCountryChange,
}: BuyerCheckoutPaymentFormProps) => {
    const [expandedSection, setExpandedSection] = useState<'card' | 'wire'>('card')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card')
    const [cardData, setCardData] = useState<CardData>({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    })

    const handleCardDataChange = (field: keyof CardData, value: string) => {
        const newData = { ...cardData, [field]: value }
        setCardData(newData)
        onCardChange?.(newData)
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        return parts.length ? parts.join(' ') : value
    }

    return (
        <div className="space-y-4">
            {/* CARD & ONLINE PAYMENT Section */}
            <div className="rounded-[24px] bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <button
                    onClick={() => setExpandedSection(expandedSection === 'card' ? 'wire' : 'card')}
                    className="flex w-full items-center justify-between p-6 text-left transition hover:bg-gray-50"
                >
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-[#191414]" />
                        <span className="text-[14px] font-bold uppercase tracking-wider text-[#191414]">
                            Card & Online Payment
                        </span>
                    </div>
                    {expandedSection === 'card' ? (
                        <ChevronUp className="h-5 w-5 text-[#595959]" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-[#595959]" />
                    )}
                </button>

                {/* Content */}
                {expandedSection === 'card' && (
                    <div className="border-t border-black/5 p-6 pt-4">
                        {/* Payment Method Tabs */}
                        <div className="mb-6 flex gap-3">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={cn(
                                    'flex flex-1 flex-col items-center gap-2 rounded-[16px] border-2 p-4 transition',
                                    paymentMethod === 'card'
                                        ? 'border-[#0066FF] bg-blue-50'
                                        : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
                                )}
                            >
                                <CreditCard className={cn('h-5 w-5', paymentMethod === 'card' ? 'text-[#0066FF]' : 'text-[#595959]')} />
                                <span className={cn('text-[13px] font-bold', paymentMethod === 'card' ? 'text-[#0066FF]' : 'text-[#595959]')}>
                                    Thẻ
                                </span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('google_pay')}
                                className={cn(
                                    'flex flex-1 flex-col items-center gap-2 rounded-[16px] border-2 p-4 transition',
                                    paymentMethod === 'google_pay'
                                        ? 'border-[#0066FF] bg-blue-50'
                                        : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
                                )}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className={cn('text-[13px] font-bold', paymentMethod === 'google_pay' ? 'text-[#0066FF]' : 'text-[#595959]')}>
                                    Google Pay
                                </span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('klarna')}
                                className={cn(
                                    'flex flex-1 flex-col items-center gap-2 rounded-[16px] border-2 p-4 transition',
                                    paymentMethod === 'klarna'
                                        ? 'border-[#0066FF] bg-blue-50'
                                        : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
                                )}
                            >
                                <span className={cn('text-[18px] font-black', paymentMethod === 'klarna' ? 'text-[#0066FF]' : 'text-[#595959]')}>
                                    K
                                </span>
                                <span className={cn('text-[13px] font-bold', paymentMethod === 'klarna' ? 'text-[#0066FF]' : 'text-[#595959]')}>
                                    Klarna
                                </span>
                            </button>
                        </div>

                        {/* Card Form */}
                        {paymentMethod === 'card' && (
                            <div className="space-y-5">
                                {/* Card Number */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                        Số Thẻ
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={cardData.cardNumber}
                                            onChange={(e) => handleCardDataChange('cardNumber', formatCardNumber(e.target.value))}
                                            placeholder="1234 1234 1234 1234"
                                            maxLength={19}
                                            className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white pr-28 text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                                        />
                                        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expiry & CVC */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                            Ngày Hết Hạn
                                        </label>
                                        <Input
                                            value={cardData.expiryDate}
                                            onChange={(e) => handleCardDataChange('expiryDate', e.target.value)}
                                            placeholder="MM / YY"
                                            maxLength={7}
                                            className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                            Mã Bảo Mật
                                        </label>
                                        <div className="relative">
                                            <Input
                                                value={cardData.cvc}
                                                onChange={(e) => handleCardDataChange('cvc', e.target.value)}
                                                placeholder="CVC"
                                                maxLength={4}
                                                type="password"
                                                className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white pr-12 text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                                            />
                                            <CreditCard className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#989898]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                        Quốc Gia
                                    </label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => onCountryChange(e.target.value)}
                                        className="h-[48px] w-full rounded-[12px] border border-[#E5E5E5] bg-white px-4 text-[15px] font-medium text-[#191414] focus:border-[#0066FF] focus:ring-0"
                                    >
                                        <option value="VN">Việt Nam</option>
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="JP">Japan</option>
                                    </select>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-[13px] leading-relaxed text-[#595959]">
                                    Khi cung cấp thông tin thẻ, bạn cho phép Artium tính phí thẻ của bạn cho các khoản thanh toán trong tương lai theo các điều khoản của họ.
                                </p>
                            </div>
                        )}

                        {/* Google Pay */}
                        {paymentMethod === 'google_pay' && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <p className="text-[14px] text-[#595959]">
                                    Click "Pay Now" to open Google Pay
                                </p>
                            </div>
                        )}

                        {/* Klarna */}
                        {paymentMethod === 'klarna' && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <p className="text-[14px] text-[#595959]">
                                    You will be redirected to Klarna to complete your purchase
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* WIRE TRANSFER Section */}
            <div className="rounded-[24px] bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <button
                    onClick={() => setExpandedSection(expandedSection === 'wire' ? 'card' : 'wire')}
                    className="flex w-full items-center justify-between p-6 text-left transition hover:bg-gray-50"
                >
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-[#191414]" />
                        <span className="text-[14px] font-bold uppercase tracking-wider text-[#191414]">
                            Wire Transfer
                        </span>
                    </div>
                    {expandedSection === 'wire' ? (
                        <ChevronUp className="h-5 w-5 text-[#595959]" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-[#595959]" />
                    )}
                </button>

                {/* Content */}
                {expandedSection === 'wire' && (
                    <div className="border-t border-black/5 p-6">
                        <p className="mb-6 text-[14px] leading-relaxed text-[#595959]">
                            Transfer funds directly to our account using the details below. Once you've made payment, contact{' '}
                            <a href="mailto:sales@artium.com" className="text-[#0066FF] hover:underline">
                                sales@artium.com
                            </a>{' '}
                            with your proof of payment. Processing times may take up to five business days.
                        </p>

                        {/* Bank Details Table */}
                        <div className="rounded-[16px] border border-[#E5E5E5] overflow-hidden">
                            <table className="w-full">
                                <tbody className="divide-y divide-[#E5E5E5]">
                                    <tr>
                                        <td className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#0066FF]">
                                            Bank Name
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-medium text-[#191414]">
                                            Silicon Valley Bank (SVB)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#0066FF]">
                                            Routing Number
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-medium text-[#191414]">
                                            121140399
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#0066FF]">
                                            Account Number
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-medium text-[#191414]">
                                            3304399019
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#0066FF]">
                                            Swift Code
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-medium text-[#191414]">
                                            SVBKUS6S
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#0066FF]">
                                            Account Name
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-medium text-[#191414]">
                                            Artium Inc
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-[#0066FF]">
                                            General Bank Reference Address
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-medium text-[#191414]">
                                            SVB, A Division of First Citizens Bank 3003 Tasman Drive, Santa Clara, CA 95054, USA
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
