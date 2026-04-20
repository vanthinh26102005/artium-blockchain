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

// @shared - apis
import artworkApis, { type ArtworkApiItem } from '@shared/apis/artworkApis'
import orderApis from '@shared/apis/orderApis'
import paymentApis from '@shared/apis/paymentApis'

type BuyerCheckoutPageViewProps = {
    artworkId: string
}

const apiArtworkToCheckout = (artwork: ArtworkApiItem): ArtworkForCheckout => {
    const rawPrice =
        typeof artwork.price === 'string' ? parseFloat(artwork.price) : artwork.price ?? 0

    return {
        id: artwork.id,
        title: artwork.title,
        artistName: artwork.creatorName || 'Unknown Artist',
        artistId: artwork.sellerId,
        price: rawPrice,
        priceLabel: `$${rawPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        coverUrl: artwork.images?.[0]?.url || '/images/placeholder-artwork.png',
        medium: artwork.materials ?? undefined,
        dimensions: artwork.dimensions
            ? `${artwork.dimensions.width} × ${artwork.dimensions.height}${artwork.dimensions.depth ? ` × ${artwork.dimensions.depth}` : ''} ${artwork.dimensions.unit}`
            : undefined,
    }
}

export const BuyerCheckoutPageView = ({ artworkId }: BuyerCheckoutPageViewProps) => {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()

    // -- state --
    const [step, setStep] = useState(1)
    const [draft, setDraft] = useState<BuyerCheckoutDraft>(defaultBuyerCheckoutDraft)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingArtwork, setIsFetchingArtwork] = useState(true)
    const [artwork, setArtwork] = useState<ArtworkForCheckout | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [cardData, setCardData] = useState<CardData>({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    })
    const [paymentCountry, setPaymentCountry] = useState('VN')

    // -- fetch artwork from API --
    useEffect(() => {
        let cancelled = false
        const fetchArtwork = async () => {
            setIsFetchingArtwork(true)
            setError(null)
            try {
                const apiArtwork = await artworkApis.getArtworkById(artworkId)
                if (cancelled) return
                if (!apiArtwork) {
                    setArtwork(null)
                } else {
                    setArtwork(apiArtworkToCheckout(apiArtwork))
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load artwork')
                }
            } finally {
                if (!cancelled) setIsFetchingArtwork(false)
            }
        }
        fetchArtwork()
        return () => { cancelled = true }
    }, [artworkId])

    // -- effect: prefill user info --
    useEffect(() => {
        if (isAuthenticated && user) {
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
        const shippingRate = draft.shippingAddress.country === 'US' ? 0.05 : 0.08
        const shippingFee = draft.deliveryMethod === 'ship_by_platform' ? artworkPrice * shippingRate : 0
        const discount = 0
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
        // TODO: Validate promo code via API
        alert('Promo code applied!')
    }, [])

    const handleCardChange = useCallback((data: CardData) => {
        setCardData(data)
    }, [])

    const handleCancel = useCallback(() => {
        if (step === 2) {
            setStep(1)
            return
        }
        if (confirm('Are you sure you want to cancel? Your order will not be saved.')) {
            router.back()
        }
    }, [router, step])

    const handleContinue = useCallback(async () => {
        if (step === 1) {
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

            setStep(2)
            return
        }

        // Step 2: Process payment via real APIs
        if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvc) {
            alert('Please fill in all card information.')
            return
        }

        if (!artwork) return

        setIsLoading(true)
        setError(null)

        try {
            // 1. Create order
            const shippingAddr = draft.deliveryMethod !== 'pickup' ? {
                line1: draft.shippingAddress.addressLine1,
                line2: draft.shippingAddress.addressLine2 || undefined,
                city: draft.shippingAddress.city,
                state: draft.shippingAddress.state,
                postalCode: draft.shippingAddress.postalCode,
                country: draft.shippingAddress.country,
            } : undefined

            const order = await orderApis.createOrder({
                sellerId: artwork.artistId || '',
                items: [{ artworkId: artwork.id, quantity: 1, price: artwork.price }],
                shippingAddress: shippingAddr,
                notes: undefined,
            })

            // 2. Create payment intent (amount in cents for Stripe)
            const amountInCents = Math.round(pricing.total * 100)
            await paymentApis.createPaymentIntent({
                amount: amountInCents,
                currency: 'usd',
                orderId: order.id,
                sellerId: artwork.artistId || undefined,
                description: `Purchase: ${artwork.title}`,
            })

            // 3. Payment created successfully — redirect to confirmation
            // In production this would use Stripe Elements / 3D Secure;
            // for now we confirm the order was placed
            alert(`Order ${order.orderNumber} placed successfully! Payment processing.`)
            router.push('/discover')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment failed. Please try again.'
            setError(message)
            alert(message)
        } finally {
            setIsLoading(false)
        }
    }, [draft, step, cardData, router, artwork, pricing.total])

    // -- loading state --
    if (isFetchingArtwork) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="mt-3 text-sm text-[#595959]">Loading artwork details...</p>
                </div>
            </div>
        )
    }

    // -- not found --
    if (!artwork) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-[#191414]">Artwork Not Found</h1>
                    <p className="mt-2 text-[#595959]">
                        {error || "The artwork you're looking for doesn't exist."}
                    </p>
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
    const isStep1Valid = (() => {
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
    })()

    // -- validation for step 2 --
    const isStep2Valid = !!(cardData.cardNumber && cardData.expiryDate && cardData.cvc)

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
