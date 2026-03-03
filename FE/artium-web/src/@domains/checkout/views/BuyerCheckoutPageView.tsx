// react
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

// @domains - checkout
import { BuyerCheckoutLayout } from '../components/BuyerCheckoutLayout'
import { BuyerCheckoutContactForm } from '../components/BuyerCheckoutContactForm'
import { BuyerCheckoutPaymentForm, type CardData } from '../components/BuyerCheckoutPaymentForm'
import { BuyerCheckoutOrderSummary } from '../components/BuyerCheckoutOrderSummary'
import {
    defaultBuyerCheckoutDraft,
    type BuyerCheckoutDraft,
    type BuyerContactInfo,
    type BuyerShippingAddress,
    type DeliveryMethod,
    type ArtworkForCheckout,
    type CheckoutPricing,
} from '../types/buyerCheckoutTypes'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

// @domains - artwork detail
import { getArtworkDetailById } from '@domains/artwork-detail/mock/mockArtworkDetail'
import { ArtworkDetail } from '@domains/artwork-detail/types'

type BuyerCheckoutPageViewProps = {
    artworkId: string
}

const artworkDetailToCheckout = (artwork: ArtworkDetail): ArtworkForCheckout => {
    const numericPriceMatch = artwork.priceLabel.match(/[\d.,]+/)
    const price = numericPriceMatch
        ? parseFloat(numericPriceMatch[0].replace(/,/g, ''))
        : 0

    return {
        id: artwork.id,
        title: artwork.title,
        artistName: artwork.artistName,
        price,
        priceLabel: artwork.priceLabel,
        coverUrl: artwork.coverUrl,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
    }
}

export const BuyerCheckoutPageView = ({ artworkId }: BuyerCheckoutPageViewProps) => {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()

    // -- state --
    const [step, setStep] = useState(1)
    const [draft, setDraft] = useState<BuyerCheckoutDraft>(defaultBuyerCheckoutDraft)
    const [isLoading, setIsLoading] = useState(false)
    const [cardData, setCardData] = useState<CardData>({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    })
    const [paymentCountry, setPaymentCountry] = useState('VN')

    // -- find artwork --
    const artwork: ArtworkForCheckout | null = useMemo(() => {
        const detail = getArtworkDetailById(artworkId)
        if (!detail) return null
        return artworkDetailToCheckout(detail)
    }, [artworkId])

    // -- effect: prefill user info --
    useEffect(() => {
        if (isAuthenticated && user) {
            // Split display name into first/last if possible
            const nameParts = (user.displayName || user.username || '').split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            setDraft((prev) => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    firstName,
                    lastName,
                    email: user.email || '',
                },
            }))
        }
    }, [isAuthenticated, user])

    // -- pricing calculation --
    const pricing: CheckoutPricing = useMemo(() => {
        if (!artwork) return { artworkPrice: 0, shippingFee: 0, discount: 0, total: 0 }

        const artworkPrice = artwork.price
        // 5% shipping for domestic, 8% for international
        const shippingRate = draft.shippingAddress.country === 'US' ? 0.05 : 0.08
        const shippingFee = draft.deliveryMethod === 'ship_by_platform' ? artworkPrice * shippingRate : 0
        const discount = 0 // TODO: implement promo code logic
        const total = artworkPrice + shippingFee - discount

        return { artworkPrice, shippingFee, discount, total }
    }, [artwork, draft.deliveryMethod, draft.shippingAddress.country])

    // -- handlers --
    const handleContactChange = useCallback((contact: BuyerContactInfo) => {
        setDraft((prev) => ({ ...prev, contact }))
    }, [])

    const handleDeliveryMethodChange = useCallback((deliveryMethod: DeliveryMethod) => {
        setDraft((prev) => ({ ...prev, deliveryMethod }))
    }, [])

    const handleShippingAddressChange = useCallback((shippingAddress: BuyerShippingAddress) => {
        setDraft((prev) => ({ ...prev, shippingAddress }))
    }, [])

    const handlePromoCodeChange = useCallback((promoCode: string) => {
        setDraft((prev) => ({ ...prev, promoCode }))
    }, [])

    const handleApplyPromo = useCallback(() => {
        // TODO: Validate promo code
        alert('Promo code applied!')
    }, [])

    const handleCardChange = useCallback((data: CardData) => {
        setCardData(data)
    }, [])

    const handleCancel = useCallback(() => {
        if (step === 2) {
            // Go back to step 1
            setStep(1)
            return
        }
        if (confirm('Are you sure you want to cancel? Your order will not be saved.')) {
            router.back()
        }
    }, [router, step])

    const handleContinue = useCallback(async () => {
        if (step === 1) {
            // Validate required fields for step 1
            const { contact, deliveryMethod, shippingAddress } = draft

            if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
                alert('Please fill in all contact information fields.')
                return
            }

            if (deliveryMethod === 'ship_by_platform') {
                if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
                    alert('Please fill in all shipping address fields.')
                    return
                }
            }

            // Go to step 2
            setStep(2)
            return
        }

        // Step 2: Process payment
        if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvc) {
            alert('Please fill in all card information.')
            return
        }

        setIsLoading(true)

        // TODO: Process actual payment
        // For now, simulate processing
        setTimeout(() => {
            setIsLoading(false)
            alert('Payment successful! Thank you for your purchase.')
            router.push('/discover')
        }, 2000)
    }, [draft, step, cardData, router])

    // -- not found --
    if (!artwork) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-[#191414]">Artwork Not Found</h1>
                    <p className="mt-2 text-[#595959]">The artwork you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/discover')}
                        className="mt-4 text-[#0066FF] hover:underline"
                    >
                        Go to Discover
                    </button>
                </div>
            </div>
        )
    }

    // -- validation for step 1 --
    const isStep1Valid = useMemo(() => {
        const { contact, deliveryMethod, shippingAddress } = draft
        const contactValid = !!(contact.firstName && contact.lastName && contact.email && contact.phone)

        if (deliveryMethod === 'pickup') return contactValid

        const addressValid = !!(
            shippingAddress.addressLine1 &&
            shippingAddress.city &&
            shippingAddress.state &&
            shippingAddress.postalCode
        )
        return contactValid && addressValid
    }, [draft])

    // -- validation for step 2 --
    const isStep2Valid = useMemo(() => {
        return !!(cardData.cardNumber && cardData.expiryDate && cardData.cvc)
    }, [cardData])

    const isFormValid = step === 1 ? isStep1Valid : isStep2Valid

    return (
        <BuyerCheckoutLayout
            step={step}
            totalSteps={2}
            reservationMinutes={20}
            onCancel={handleCancel}
            onContinue={handleContinue}
            continueLabel={step === 1 ? 'Continue to Payment' : 'Pay Now'}
            isContinueDisabled={!isFormValid}
            isLoading={isLoading}
            orderSummary={
                <BuyerCheckoutOrderSummary
                    artwork={artwork}
                    pricing={pricing}
                    promoCode={draft.promoCode}
                    onPromoCodeChange={handlePromoCodeChange}
                    onApplyPromo={handleApplyPromo}
                />
            }
        >
            {step === 1 ? (
                <BuyerCheckoutContactForm
                    contact={draft.contact}
                    deliveryMethod={draft.deliveryMethod}
                    shippingAddress={draft.shippingAddress}
                    onContactChange={handleContactChange}
                    onDeliveryMethodChange={handleDeliveryMethodChange}
                    onShippingAddressChange={handleShippingAddressChange}
                />
            ) : (
                <BuyerCheckoutPaymentForm
                    onCardChange={handleCardChange}
                    selectedCountry={paymentCountry}
                    onCountryChange={setPaymentCountry}
                />
            )}
        </BuyerCheckoutLayout>
    )
}
