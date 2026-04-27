// react
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'

// stripe
import { useStripe, useElements, CardNumberElement } from '@stripe/react-stripe-js'

// @domains - checkout
import { BuyerCheckoutLayout } from '../components/BuyerCheckoutLayout'
import { BuyerCheckoutContactForm } from '../components/BuyerCheckoutContactForm'
import { BuyerCheckoutPaymentForm } from '../components/BuyerCheckoutPaymentForm'
import { BuyerCheckoutOrderSummary } from '../components/BuyerCheckoutOrderSummary'
import { CheckoutSuccessScreen } from '../components/CheckoutSuccessScreen'
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
import { classifyPaymentError, type ClassifiedPaymentError } from '../utils/paymentErrors'
import {
  clearCheckoutSuccessState,
  loadCheckoutSuccessState,
  saveCheckoutSuccessState,
  type CheckoutSuccessState,
} from '../utils/checkoutSuccessState'
import { useWalletCheckout } from '../hooks/useWalletCheckout'

// @domains - auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

// @shared - apis
import artworkApis, { type ArtworkApiItem } from '@shared/apis/artworkApis'
import orderApis from '@shared/apis/orderApis'
import paymentApis from '@shared/apis/paymentApis'
import type { EthereumQuoteResponse, PaymentTransactionResponse } from '@shared/apis/paymentApis'

type BuyerCheckoutPageViewProps = {
  artworkId: string
}

const apiArtworkToCheckout = (artwork: ArtworkApiItem): ArtworkForCheckout => {
  const rawPrice =
    typeof artwork.price === 'string' ? parseFloat(artwork.price) : (artwork.price ?? 0)

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
  const stripe = useStripe()
  const elements = useElements()

  // -- state --
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingArtwork, setIsFetchingArtwork] = useState(true)
  const [artwork, setArtwork] = useState<ArtworkForCheckout | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<CheckoutSuccessState | null>(null)
  const [paymentError, setPaymentError] = useState<ClassifiedPaymentError | null>(null)
  const [cardElementsComplete, setCardElementsComplete] = useState(false)
  const [paymentFormResetKey, setPaymentFormResetKey] = useState(0)
  const [walletQuote, setWalletQuote] = useState<EthereumQuoteResponse | null>(null)
  const [walletQuoteStatus, setWalletQuoteStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle')
  const [walletQuoteError, setWalletQuoteError] = useState<string | null>(null)
  const [walletQuoteRefreshKey, setWalletQuoteRefreshKey] = useState(0)
  const [walletQuoteClock, setWalletQuoteClock] = useState(() => Date.now())

  const contactForm = useForm<BuyerCheckoutContactStepValues>({
    resolver: zodResolver(buyerCheckoutContactStepSchema),
    defaultValues: defaultBuyerCheckoutDraft,
    mode: 'onChange',
  })
  const paymentForm = useForm<BuyerCheckoutPaymentValues>({
    resolver: zodResolver(buyerCheckoutPaymentSchema),
    defaultValues: {
      paymentMethod: 'card',
      country: 'VN',
    },
    mode: 'onChange',
  })
  const watchedDraft = useWatch({ control: contactForm.control })
  const watchedPaymentValues = useWatch({ control: paymentForm.control })
  const watchedPaymentMethod = watchedPaymentValues?.paymentMethod ?? 'card'
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

  // -- hydrate persisted success state for refresh/back-entry on the checkout route --
  useEffect(() => {
    const persistedSuccessState = loadCheckoutSuccessState(artworkId)
    if (!persistedSuccessState) {
      return
    }

    setPaymentResult(persistedSuccessState)

    if (!router.isReady || router.query.status === 'success') {
      return
    }

    void router.replace(`/checkout/${artworkId}?status=success`, undefined, { shallow: true })
  }, [artworkId, router])

  // -- fetch artwork from API --
  useEffect(() => {
    let cancelled = false
    const fetchArtwork = async () => {
      setIsFetchingArtwork(true)
      setFetchError(null)
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
          setFetchError(err instanceof Error ? err.message : 'Failed to load artwork')
        }
      } finally {
        if (!cancelled) setIsFetchingArtwork(false)
      }
    }
    fetchArtwork()
    return () => {
      cancelled = true
    }
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
    const shippingFee =
      draft.deliveryMethod === 'ship_by_platform' ? artworkPrice * shippingRate : 0
    const discount = 0
    const total = artworkPrice + shippingFee - discount

    return { artworkPrice, shippingFee, discount, total }
  }, [artwork, draft.deliveryMethod, draft.shippingAddress.country])

  const isWalletQuoteExpired =
    walletQuote !== null && new Date(walletQuote.expiresAt).getTime() <= walletQuoteClock
  const walletQuoteExpiresInSeconds = walletQuote
    ? Math.max(0, Math.ceil((new Date(walletQuote.expiresAt).getTime() - walletQuoteClock) / 1000))
    : null
  const walletCheckout = useWalletCheckout({
    quote: walletQuote,
    isQuoteExpired: isWalletQuoteExpired,
  })
  const connectedWalletAddress = walletCheckout.walletAddress
  const clearWalletTransactionState = walletCheckout.clearTransactionState
  const submitWalletTransaction = walletCheckout.submitQuotedTransaction

  useEffect(() => {
    const nextWalletAddress = connectedWalletAddress
    const currentWalletAddress = paymentForm.getValues('walletAddress')

    if ((currentWalletAddress ?? '') === nextWalletAddress) {
      return
    }

    paymentForm.setValue('walletAddress', nextWalletAddress, {
      shouldDirty: true,
      shouldValidate: connectedWalletAddress.length > 0,
    })
  }, [connectedWalletAddress, paymentForm])

  // -- handlers --
  const handlePromoCodeChange = useCallback(
    (promoCode: string) => {
      contactForm.setValue('promoCode', promoCode, { shouldDirty: true })
    },
    [contactForm],
  )

  const handleApplyPromo = useCallback(() => {
    // TODO: Validate promo code via API
  }, [])

  const handleCancel = useCallback(() => {
    if (step === 2) {
      setStep(1)
      setPaymentError(null)
      setCardElementsComplete(false)
      return
    }
    router.back()
  }, [router, step])

  const updateStoredPaymentResult = useCallback(
    (updater: (current: CheckoutSuccessState) => CheckoutSuccessState) => {
      setPaymentResult((current) => {
        if (!current) {
          return current
        }

        const nextPaymentResult = updater(current)
        saveCheckoutSuccessState(nextPaymentResult)
        return nextPaymentResult
      })
    },
    [],
  )

  const showSuccessState = useCallback(
    (nextPaymentResult: CheckoutSuccessState) => {
      saveCheckoutSuccessState(nextPaymentResult)
      setPaymentResult(nextPaymentResult)
      void router.replace(`/checkout/${artworkId}?status=success`, undefined, { shallow: true })
    },
    [artworkId, router],
  )

  const resetPaymentStepState = useCallback(() => {
    clearCheckoutSuccessState(artworkId)
    setPaymentError(null)
    setCardElementsComplete(false)
    setWalletQuote(null)
    setWalletQuoteStatus('idle')
    setWalletQuoteError(null)
    clearWalletTransactionState()
    setPaymentFormResetKey((current) => current + 1)
    paymentForm.reset({
      paymentMethod: 'card',
      country: paymentForm.getValues('country') || 'VN',
    })
  }, [artworkId, clearWalletTransactionState, paymentForm])

  const refreshWalletQuote = useCallback(() => {
    setWalletQuoteRefreshKey((current) => current + 1)
  }, [])

  useEffect(() => {
    if (step !== 2 || watchedPaymentMethod !== 'wallet') {
      setWalletQuoteClock(Date.now())
      return
    }

    setWalletQuoteClock(Date.now())
    const intervalId = window.setInterval(() => {
      setWalletQuoteClock(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [step, watchedPaymentMethod])

  useEffect(() => {
    if (step !== 2 || watchedPaymentMethod !== 'wallet') {
      setWalletQuote(null)
      setWalletQuoteStatus('idle')
      setWalletQuoteError(null)
      return
    }

    let cancelled = false

    const fetchWalletQuote = async () => {
      setWalletQuoteStatus('loading')
      setWalletQuoteError(null)

      try {
        const quote = await paymentApis.getEthereumQuote(pricing.total)
        if (cancelled) return
        setWalletQuote(quote)
        setWalletQuoteStatus('ready')
      } catch (err) {
        if (cancelled) return
        setWalletQuote(null)
        setWalletQuoteStatus('error')
        setWalletQuoteError(
          err instanceof Error ? err.message : 'Unable to fetch a MetaMask quote right now.',
        )
      }
    }

    void fetchWalletQuote()

    return () => {
      cancelled = true
    }
  }, [pricing.total, step, walletQuoteRefreshKey, watchedPaymentMethod])

  useEffect(() => {
    if (
      !paymentResult ||
      paymentResult.paymentMethod !== 'wallet' ||
      paymentResult.status !== 'processing' ||
      !paymentResult.transactionId
    ) {
      return
    }

    let cancelled = false
    let timeoutId: number | null = null

    const scheduleNextPoll = () => {
      timeoutId = window.setTimeout(() => {
        void pollTransactionStatus()
      }, 5000)
    }

    const mapTransactionToCheckoutStatus = (
      transaction: PaymentTransactionResponse,
    ): CheckoutSuccessState['status'] | null => {
      if (transaction.status === 'SUCCEEDED') {
        return 'succeeded'
      }

      if (transaction.status === 'FAILED') {
        return 'failed'
      }

      return null
    }

    const pollTransactionStatus = async () => {
      const transactionId = paymentResult.transactionId
      if (!transactionId) {
        return
      }

      try {
        const transaction = await paymentApis.getTransactionById(transactionId)
        if (cancelled) {
          return
        }

        const nextStatus = mapTransactionToCheckoutStatus(transaction)
        if (!nextStatus) {
          scheduleNextPoll()
          return
        }

        updateStoredPaymentResult((current) => ({
          ...current,
          status: nextStatus,
          orderId: transaction.orderId ?? current.orderId ?? null,
          failureReason:
            nextStatus === 'failed'
              ? transaction.failureReason || 'We could not confirm the Sepolia transaction.'
              : null,
        }))
      } catch {
        if (!cancelled) {
          scheduleNextPoll()
        }
      }
    }

    void pollTransactionStatus()

    return () => {
      cancelled = true
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [paymentResult, updateStoredPaymentResult])

  const handleContinue = useCallback(async () => {
    setPaymentError(null)

    if (step === 1) {
      const isStepValid = await contactForm.trigger()
      if (!isStepValid) {
        if (
          contactForm.getValues('deliveryMethod') === 'ship_by_platform' &&
          contactForm.formState.errors.shippingAddress
        ) {
          setPaymentError({
            type: 'generic',
            message: 'Please fill in all shipping address fields.',
          })
          return
        }
        setPaymentError({
          type: 'generic',
          message: 'Please fill in all contact information fields.',
        })
        return
      }

      setStep(2)
      return
    }

    const paymentValues = paymentForm.getValues()

    if (paymentValues.paymentMethod === 'card') {
      if (!paymentValues.country?.trim()) {
        setPaymentError({ type: 'generic', message: 'Please select your billing country.' })
        return
      }

      if (!cardElementsComplete) {
        setPaymentError({ type: 'generic', message: 'Please complete your card details.' })
        return
      }
    } else {
      if (!walletQuote) {
        setPaymentError({
          type: 'generic',
          message: 'A live Sepolia quote is required before MetaMask checkout can continue.',
        })
        return
      }

      if (isWalletQuoteExpired) {
        setPaymentError({
          type: 'generic',
          message: 'The Sepolia quote expired. Refresh the quote and try again.',
        })
        return
      }

      const isStepValid = await paymentForm.trigger()
      if (!isStepValid) {
        setPaymentError({
          type: 'generic',
          message: 'Please complete your wallet payment details.',
        })
        return
      }
    }

    if (!artwork) return

    const checkoutValues = contactForm.getValues()
    clearCheckoutSuccessState(artworkId)

    // Guard: Stripe context must be ready for card payments
    if (paymentValues.paymentMethod === 'card' && (!stripe || !elements)) {
      setPaymentError({
        type: 'generic',
        message: 'Payment form is not ready yet. Please wait a moment and try again.',
      })
      return
    }

    setIsLoading(true)

    let createdOrder: Awaited<ReturnType<typeof orderApis.createOrder>> | null = null
    let submittedWalletTxHash = ''

    try {
      const shippingAddr =
        checkoutValues.deliveryMethod !== 'pickup'
          ? {
              line1: checkoutValues.shippingAddress.addressLine1,
              line2: checkoutValues.shippingAddress.addressLine2 || undefined,
              city: checkoutValues.shippingAddress.city,
              state: checkoutValues.shippingAddress.state,
              postalCode: checkoutValues.shippingAddress.postalCode,
              country: checkoutValues.shippingAddress.country,
            }
          : undefined

      createdOrder = await orderApis.createOrder({
        sellerId: artwork.artistId || '',
        items: [
          {
            artworkId: artwork.id,
            quantity: 1,
            price: artwork.price,
            artworkTitle: artwork.title,
            artworkImageUrl: artwork.coverUrl,
          },
        ],
        shippingAddress: shippingAddr,
        shippingCost: pricing.shippingFee,
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
          orderId: createdOrder.id,
          sellerId: artwork.artistId || undefined,
          description: `Purchase: ${artwork.title}`,
        })

        if (!intent.clientSecret) {
          throw new Error('Stripe did not return a payment confirmation token. Please try again.')
        }

        // Confirm card payment in-browser using the same Stripe account as the publishable key.
        const cardNumberEl = elements!.getElement(CardNumberElement)
        if (!cardNumberEl)
          throw new Error('Card form is not mounted. Please refresh and try again.')
        const confirmation = await stripe!.confirmCardPayment(intent.clientSecret, {
          payment_method: {
            card: cardNumberEl,
            billing_details: {
              name: `${checkoutValues.contact.firstName} ${checkoutValues.contact.lastName}`.trim(),
              email: checkoutValues.contact.email,
              address: { country: paymentValues.country },
            },
          },
        })

        if (confirmation.error) {
          throw new Error(confirmation.error.message ?? 'Card payment failed')
        }

        const confirmedStatus = confirmation.paymentIntent?.status
        if (confirmedStatus !== 'succeeded' && confirmedStatus !== 'processing') {
          throw new Error('Card payment could not be completed. Please try again.')
        }

        const nextPaymentResult: CheckoutSuccessState = {
          artworkId,
          orderNumber: createdOrder.orderNumber,
          paymentMethod: 'card',
          status: confirmedStatus === 'processing' ? 'processing' : 'succeeded',
          totalPaid: createdOrder.totalAmount,
          orderId: createdOrder.id,
          transactionId: intent.id,
          failureReason: null,
        }

        showSuccessState(nextPaymentResult)
      } else if (paymentValues.paymentMethod === 'wallet') {
        if (!walletQuote || isWalletQuoteExpired) {
          throw new Error('The Sepolia quote expired. Refresh the quote and retry the payment.')
        }

        const { txHash } = await submitWalletTransaction()
        submittedWalletTxHash = txHash

        if (
          !createdOrder ||
          Math.round(createdOrder.totalAmount * 100) !== Math.round(walletQuote.usdAmount * 100)
        ) {
          throw new Error('The checkout total changed. Refresh the Sepolia quote and try again.')
        }

        const recordedTransaction = await paymentApis.recordEthereumPayment({
          txHash,
          walletAddress: connectedWalletAddress,
          orderId: createdOrder.id,
          amount: walletQuote.usdAmount,
          currency: 'USD',
          quoteToken: walletQuote.quoteToken,
          chainId: walletQuote.chainId,
          description: `Purchase: ${artwork.title}`,
        })

        const nextPaymentResult: CheckoutSuccessState = {
          artworkId,
          orderNumber: createdOrder.orderNumber,
          paymentMethod: 'wallet',
          status: 'processing',
          totalPaid: createdOrder.totalAmount,
          orderId: createdOrder.id,
          transactionId: recordedTransaction.id,
          failureReason: null,
        }

        showSuccessState(nextPaymentResult)
      } else {
        throw new Error('Unsupported payment method.')
      }
    } catch (err) {
      const isWalletPayment = paymentForm.getValues('paymentMethod') === 'wallet'
      const walletTxHash = submittedWalletTxHash

      if (createdOrder && !(isWalletPayment && walletTxHash)) {
        void orderApis.cancelOrder(createdOrder.id, 'Payment failed').catch(() => undefined)
      }

      if (isWalletPayment && walletTxHash) {
        setPaymentError({
          type: 'generic',
          message:
            `Your wallet payment was sent successfully but we need to manually verify it. ` +
            `Please contact support with your transaction hash: ${walletTxHash.substring(0, 10)}...`,
        })
      } else {
        setPaymentError(classifyPaymentError(err))
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    artwork,
    artworkId,
    cardElementsComplete,
    contactForm,
    elements,
    isWalletQuoteExpired,
    paymentForm,
    pricing.shippingFee,
    pricing.total,
    showSuccessState,
    step,
    submitWalletTransaction,
    stripe,
    walletQuote,
    connectedWalletAddress,
  ])

  const handlePaymentRecovery = useCallback(() => {
    if (!paymentError?.recoveryAction) {
      return
    }

    if (paymentError.recoveryAction === 'reset-payment') {
      resetPaymentStepState()
      return
    }

    if (paymentError.recoveryAction === 'retry-submit') {
      void handleContinue()
    }
  }, [handleContinue, paymentError, resetPaymentStepState])

  const handleContinueShopping = useCallback(() => {
    clearCheckoutSuccessState(artworkId)
    setPaymentResult(null)
    setPaymentError(null)
    void router.push('/discover')
  }, [artworkId, router])

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
            {fetchError || "The artwork you're looking for doesn't exist."}
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

  // -- success screen (step 3) --
  if (paymentResult) {
    return (
      <CheckoutSuccessScreen
        orderNumber={paymentResult.orderNumber}
        artwork={artwork}
        totalPaid={paymentResult.totalPaid}
        paymentMethod={paymentResult.paymentMethod}
        status={paymentResult.status}
        failureReason={paymentResult.failureReason}
        onContinueShopping={handleContinueShopping}
      />
    )
  }

  const isStep1Valid = contactForm.formState.isValid
  const isCardReady =
    watchedPaymentValues?.paymentMethod === 'card' &&
    Boolean(watchedPaymentValues.country?.trim()) &&
    cardElementsComplete
  const isWalletReady =
    watchedPaymentValues?.paymentMethod === 'wallet' &&
    walletQuoteStatus === 'ready' &&
    Boolean(walletQuote) &&
    !isWalletQuoteExpired &&
    Boolean(connectedWalletAddress.trim())
  const isStep2Valid =
    watchedPaymentMethod === 'card'
      ? isCardReady
      : watchedPaymentMethod === 'wallet'
        ? isWalletReady
        : false
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
        <>
          <FormProvider {...contactForm}>
            <BuyerCheckoutContactForm />
          </FormProvider>
          {paymentError && step === 1 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[13px] text-red-700">{paymentError.message}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {paymentError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[13px] font-semibold text-red-700">{paymentError.message}</p>
              {paymentError.recoveryAction === 'reset-payment' && (
                <p className="mt-1 text-[12px] text-red-600">Your card has not been charged.</p>
              )}
              {paymentError.ctaLabel && paymentError.recoveryAction && (
                <button
                  type="button"
                  onClick={handlePaymentRecovery}
                  disabled={isLoading}
                  className="mt-3 text-[12px] font-semibold text-red-700 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentError.ctaLabel}
                </button>
              )}
            </div>
          )}
          <FormProvider {...paymentForm}>
            <BuyerCheckoutPaymentForm
              key={paymentFormResetKey}
              walletQuote={walletQuote}
              walletQuoteStatus={walletQuoteStatus}
              walletQuoteError={walletQuoteError}
              isWalletQuoteExpired={isWalletQuoteExpired}
              walletQuoteExpiresInSeconds={walletQuoteExpiresInSeconds}
              onRefreshWalletQuote={refreshWalletQuote}
              walletCheckout={walletCheckout}
              onCardElementsChange={setCardElementsComplete}
            />
          </FormProvider>
        </>
      )}
    </BuyerCheckoutLayout>
  )
}
