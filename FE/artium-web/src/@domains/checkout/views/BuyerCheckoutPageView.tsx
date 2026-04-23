// react
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'

// @domains - checkout
import { BuyerCheckoutLayout } from '../components/BuyerCheckoutLayout'
import { BuyerCheckoutContactForm } from '../components/BuyerCheckoutContactForm'
import { BuyerCheckoutPaymentForm } from '../components/BuyerCheckoutPaymentForm'
import { BuyerCheckoutOrderSummary } from '../components/BuyerCheckoutOrderSummary'
import {
    defaultBuyerCheckoutDraft,
    type ArtworkForCheckout,
    type CheckoutPricing,
} from '../types/buyerCheckoutTypes'
import {
    buyerCheckoutContactStepSchema,
    buyerCheckoutPaymentSchema,
    type BuyerCheckoutContactStepValues,
    type BuyerCheckoutPaymentValues,
} from '../validations/buyerCheckout.schema'
import { createStripePaymentMethod } from '../hooks/useStripeCardToken'

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
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingArtwork, setIsFetchingArtwork] = useState(true)
    const [artwork, setArtwork] = useState<ArtworkForCheckout | null>(null)
    const [error, setError] = useState<string | null>(null)
    const contactForm = useForm<BuyerCheckoutContactStepValues>({
        resolver: zodResolver(buyerCheckoutContactStepSchema),
        defaultValues: defaultBuyerCheckoutDraft,
        mode: 'onChange',
    })
    const paymentForm = useForm<BuyerCheckoutPaymentValues>({
        resolver: zodResolver(buyerCheckoutPaymentSchema),
        defaultValues: {
            paymentMethod: 'card',
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            country: '',
        },
        mode: 'onChange',
    })
    const watchedDraft = useWatch({ control: contactForm.control })
    const draft: BuyerCheckoutContactStepValues = {
        ...defaultBuyerCheckoutDraft,
        ...watchedDraft,
        contact: {
            ...defaultBuyerCheckoutDraft.contact,
            ...watchedDraft?.contact,
        },
        shippingAddress: {
            ...defaultBuyerCheckoutDraft.shippingAddress,
            ...watchedDraft?.shippingAddress,
        },
    }

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

            contactForm.setValue('contact.firstName', firstName)
            contactForm.setValue('contact.lastName', lastName)
            contactForm.setValue('contact.email', user.email || '')
        }
    }, [contactForm, isAuthenticated, user])

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
    const handlePromoCodeChange = useCallback((promoCode: string) => {
        contactForm.setValue('promoCode', promoCode, { shouldDirty: true })
    }, [contactForm])

    const handleApplyPromo = useCallback(() => {
        // TODO: Validate promo code via API
    }, [])

    const handleCancel = useCallback(() => {
        if (step === 2) {
            setStep(1)
            return
        }
        router.back()
    }, [router, step])

    const handleContinue = useCallback(async () => {
        setError(null)

        if (step === 1) {
            const isStepValid = await contactForm.trigger()
            if (!isStepValid) {
                if (
                    contactForm.getValues('deliveryMethod') === 'ship_by_platform' &&
                    contactForm.formState.errors.shippingAddress
                ) {
                    setError('Please fill in all shipping address fields.')
                    return
                }
                setError('Please fill in all contact information fields.')
                return
            }

            setStep(2)
            return
        }

        const isStepValid = await paymentForm.trigger()
        if (!isStepValid) {
            setError('Please fill in all payment information.')
            return
        }

        if (!artwork) return

        const checkoutValues = contactForm.getValues()
        const paymentValues = paymentForm.getValues()

        setIsLoading(true)

        try {
            const shippingAddr = checkoutValues.deliveryMethod !== 'pickup' ? {
                line1: checkoutValues.shippingAddress.addressLine1,
                line2: checkoutValues.shippingAddress.addressLine2 || undefined,
                city: checkoutValues.shippingAddress.city,
                state: checkoutValues.shippingAddress.state,
                postalCode: checkoutValues.shippingAddress.postalCode,
                country: checkoutValues.shippingAddress.country,
            } : undefined

            const order = await orderApis.createOrder({
                sellerId: artwork.artistId || '',
                items: [{ artworkId: artwork.id, quantity: 1, price: artwork.price }],
                shippingAddress: shippingAddr,
                notes: undefined,
            })

            if (paymentValues.paymentMethod === 'card') {
                // Ensure Stripe customer exists (409 = already exists, ignore)
                try {
                    await paymentApis.createStripeCustomer({ email: checkoutValues.contact.email })
                } catch (err: unknown) {
                    const status =
                        (err as { status?: number })?.status ??
                        (err as { statusCode?: number })?.statusCode ??
                        (err as { response?: { status?: number } })?.response?.status
                    if (status !== 409) {
                        throw new Error('Failed to set up payment account. Please try again.')
                    }
                }

                // Create payment intent (amount in cents)
                const amountInCents = Math.round(pricing.total * 100)
                const intent = await paymentApis.createPaymentIntent({
                    amount: amountInCents,
                    currency: 'usd',
                    orderId: order.id,
                    sellerId: artwork.artistId || undefined,
                    description: `Purchase: ${artwork.title}`,
                })

                // Tokenize raw card inputs via Stripe.js
                const expiryParts = paymentValues.expiryDate.split('/')
                const expMonth = parseInt(expiryParts[0]?.trim() ?? '0', 10)
                const expYear = parseInt(expiryParts[1]?.trim() ?? '0', 10)
                const pmId = await createStripePaymentMethod({
                    number: paymentValues.cardNumber,
                    exp_month: expMonth,
                    exp_year: expYear,
                    cvc: paymentValues.cvc,
                })

                // Confirm payment intent with tokenized payment method
                await paymentApis.confirmPaymentIntent({
                    paymentIntentId: intent.stripePaymentIntentId,
                    stripePaymentMethodId: pmId,
                })
            } else if (paymentValues.paymentMethod === 'wallet') {
                await paymentApis.recordEthereumPayment({
                    txHash: paymentValues.txHash,
                    walletAddress: paymentValues.walletAddress,
                    orderId: order.id,
                    amount: pricing.total,
                    currency: 'ETH',
                    description: `Purchase: ${artwork.title}`,
                })
            }

            // Success: redirect to discover with success query param
            void router.push(`/discover?checkout=success&orderNumber=${order.orderNumber}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment failed. Please try again.'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [artwork, contactForm, paymentForm, pricing.total, router, step])

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

    const isStep1Valid = contactForm.formState.isValid
    const isStep2Valid = paymentForm.formState.isValid
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
                <FormProvider {...contactForm}>
                    <BuyerCheckoutContactForm />
                </FormProvider>
            ) : (
                <>
                    <FormProvider {...paymentForm}>
                        <BuyerCheckoutPaymentForm ethAmount={pricing.total} />
                    </FormProvider>
                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-[13px] text-red-700">{error}</p>
                        </div>
                    )}
                </>
            )}
        </BuyerCheckoutLayout>
    )
}

