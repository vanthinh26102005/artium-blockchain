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

/**
 * apiArtworkToCheckout - Utility function
 * @returns void
 */
const apiArtworkToCheckout = (artwork: ArtworkApiItem): ArtworkForCheckout => {
  const rawPrice =
    typeof artwork.price === 'string' ? parseFloat(artwork.price) : (artwork.price ?? 0)

  /**
   * rawPrice - Utility function
   * @returns void
   */
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

  /**
   * BuyerCheckoutPageView - React component
   * @returns React element
   */
  // -- state --
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingArtwork, setIsFetchingArtwork] = useState(true)
  /**
   * router - Utility function
   * @returns void
   */
  const [artwork, setArtwork] = useState<ArtworkForCheckout | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<CheckoutSuccessState | null>(null)
  const [paymentError, setPaymentError] = useState<ClassifiedPaymentError | null>(null)
  const [cardElementsComplete, setCardElementsComplete] = useState(false)
  /**
   * stripe - Utility function
   * @returns void
   */
  const [paymentFormResetKey, setPaymentFormResetKey] = useState(0)
  const [walletQuote, setWalletQuote] = useState<EthereumQuoteResponse | null>(null)
  const [walletQuoteStatus, setWalletQuoteStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
    /**
     * elements - Utility function
     * @returns void
     */
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
    /**
     * contactForm - Utility function
     * @returns void
     */
    ...watchedDraft,
    contact: {
      ...defaultBuyerCheckoutDraft.contact,
      ...watchedDraft?.contact,
    },
    shippingAddress: {
      ...defaultBuyerCheckoutDraft.shippingAddress,
      ...watchedDraft?.shippingAddress,
      /**
       * paymentForm - Utility function
       * @returns void
       */
    },
  }

  // -- hydrate persisted success state for refresh/back-entry on the checkout route --
  useEffect(() => {
    const persistedSuccessState = loadCheckoutSuccessState(artworkId)
    if (!persistedSuccessState) {
      return
    }

    setPaymentResult(persistedSuccessState)
    /**
     * watchedDraft - Utility function
     * @returns void
     */

    if (!router.isReady || router.query.status === 'success') {
      return
    }
    /**
     * watchedPaymentValues - Utility function
     * @returns void
     */

    void router.replace(`/checkout/${artworkId}?status=success`, undefined, { shallow: true })
  }, [artworkId, router])

  /**
   * watchedPaymentMethod - Utility function
   * @returns void
   */
  // -- fetch artwork from API --
  useEffect(() => {
    let cancelled = false
    const fetchArtwork = async () => {
      /**
       * draft - Utility function
       * @returns void
       */
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
    /**
     * persistedSuccessState - Utility function
     * @returns void
     */
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
  /**
   * fetchArtwork - Utility function
   * @returns void
   */
  const pricing: CheckoutPricing = useMemo(() => {
    if (!artwork) return { artworkPrice: 0, shippingFee: 0, discount: 0, total: 0 }

    const artworkPrice = artwork.price
    const shippingRate = draft.shippingAddress.country === 'US' ? 0.05 : 0.08
    const shippingFee =
      draft.deliveryMethod === 'ship_by_platform' ? artworkPrice * shippingRate : 0
    /**
     * apiArtwork - Utility function
     * @returns void
     */
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
  const syncWalletState = walletCheckout.syncWalletState

  useEffect(() => {
    const nextWalletAddress = connectedWalletAddress
    const currentWalletAddress = paymentForm.getValues('walletAddress')

    if ((currentWalletAddress ?? '') === nextWalletAddress) {
      return
    }
    /**
     * nameParts - Utility function
     * @returns void
     */

    paymentForm.setValue('walletAddress', nextWalletAddress, {
      shouldDirty: true,
      shouldValidate: connectedWalletAddress.length > 0,
      /**
       * firstName - Utility function
       * @returns void
       */
    })
    if (nextWalletAddress) {
      paymentForm.clearErrors('walletAddress')
    }
    /**
     * lastName - Utility function
     * @returns void
     */
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
    /**
     * pricing - Utility function
     * @returns void
     */
  }, [])

  const handleCancel = useCallback(() => {
    if (step === 2) {
      setStep(1)
      setPaymentError(null)
      /**
       * artworkPrice - Utility function
       * @returns void
       */
      setCardElementsComplete(false)
      return
    }
    router.back()
    /**
     * shippingRate - Utility function
     * @returns void
     */
  }, [router, step])

  const updateStoredPaymentResult = useCallback(
    (updater: (current: CheckoutSuccessState) => CheckoutSuccessState) => {
      /**
       * shippingFee - Utility function
       * @returns void
       */
      setPaymentResult((current) => {
        if (!current) {
          return current
        }

        /**
         * discount - Utility function
         * @returns void
         */
        const nextPaymentResult = updater(current)
        saveCheckoutSuccessState(nextPaymentResult)
        return nextPaymentResult
      })
      /**
       * total - Utility function
       * @returns void
       */
    },
    [],
  )

  const showSuccessState = useCallback(
    (nextPaymentResult: CheckoutSuccessState) => {
      saveCheckoutSuccessState(nextPaymentResult)
      setPaymentResult(nextPaymentResult)
      /**
       * isWalletQuoteExpired - Utility function
       * @returns void
       */
      void router.replace(`/checkout/${artworkId}?status=success`, undefined, { shallow: true })
    },
    [artworkId, router],
  )

  /**
   * walletQuoteExpiresInSeconds - Utility function
   * @returns void
   */
  const resetPaymentStepState = useCallback(() => {
    clearCheckoutSuccessState(artworkId)
    setPaymentError(null)
    setCardElementsComplete(false)
    setWalletQuote(null)
    setWalletQuoteStatus('idle')
    /**
     * walletCheckout - Utility function
     * @returns void
     */
    setWalletQuoteError(null)
    clearWalletTransactionState()
    setPaymentFormResetKey((current) => current + 1)
    paymentForm.reset({
      paymentMethod: 'card',
      country: paymentForm.getValues('country') || 'VN',
    })
    /**
     * connectedWalletAddress - Utility function
     * @returns void
     */
  }, [artworkId, clearWalletTransactionState, paymentForm])

  const refreshWalletQuote = useCallback(() => {
    setWalletQuoteRefreshKey((current) => current + 1)
    /**
     * clearWalletTransactionState - Utility function
     * @returns void
     */
  }, [])

  useEffect(() => {
    if (step !== 2 || watchedPaymentMethod !== 'wallet') {
      /**
       * submitWalletTransaction - Utility function
       * @returns void
       */
      setWalletQuoteClock(Date.now())
      return
    }

    /**
     * syncWalletState - Utility function
     * @returns void
     */
    setWalletQuoteClock(Date.now())
    const intervalId = window.setInterval(() => {
      setWalletQuoteClock(Date.now())
    }, 1000)

    return () => {
      /**
       * nextWalletAddress - Utility function
       * @returns void
       */
      window.clearInterval(intervalId)
    }
  }, [step, watchedPaymentMethod])

  /**
   * currentWalletAddress - Utility function
   * @returns void
   */
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
        /**
         * handlePromoCodeChange - Utility function
         * @returns void
         */
      } catch (err) {
        if (cancelled) return
        setWalletQuote(null)
        setWalletQuoteStatus('error')
        setWalletQuoteError(
          err instanceof Error ? err.message : 'Unable to fetch a MetaMask quote right now.',
        )
      }
    }

    /**
     * handleApplyPromo - Utility function
     * @returns void
     */
    void fetchWalletQuote()

    return () => {
      cancelled = true
    }
  }, [pricing.total, step, walletQuoteRefreshKey, watchedPaymentMethod])

  /**
   * handleCancel - Utility function
   * @returns void
   */
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

    /**
     * updateStoredPaymentResult - Utility function
     * @returns void
     */
    const scheduleNextPoll = () => {
      timeoutId = window.setTimeout(() => {
        void pollTransactionStatus()
      }, 5000)
    }

    const mapTransactionToCheckoutStatus = (
      transaction: PaymentTransactionResponse,
    ): CheckoutSuccessState['status'] | null => {
      if (transaction.status === 'SUCCEEDED') {
        /**
         * nextPaymentResult - Utility function
         * @returns void
         */
        return 'succeeded'
      }

      if (transaction.status === 'FAILED') {
        return 'failed'
      }

      return null
    }

    const pollTransactionStatus = async () => {
      /**
       * showSuccessState - Utility function
       * @returns void
       */
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
        /**
         * resetPaymentStepState - Utility function
         * @returns void
         */
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
        /**
         * refreshWalletQuote - Utility function
         * @returns void
         */
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
    /**
     * intervalId - Utility function
     * @returns void
     */
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

      /**
       * fetchWalletQuote - Utility function
       * @returns void
       */
      setStep(2)
      return
    }

    const paymentValues = paymentForm.getValues()

    if (paymentValues.paymentMethod === 'card') {
      if (!paymentValues.country?.trim()) {
        /**
         * quote - Utility function
         * @returns void
         */
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

      const walletState = await syncWalletState()
      const walletAddressForValidation = walletState.walletAddress.trim()

      paymentForm.setValue('walletAddress', walletAddressForValidation, {
        shouldDirty: true,
        shouldValidate: false,
      })

      if (walletAddressForValidation) {
        paymentForm.clearErrors('walletAddress')
      }

      /**
       * scheduleNextPoll - Utility function
       * @returns void
       */
      const isStepValid = await paymentForm.trigger()
      if (!isStepValid) {
        setPaymentError({
          type: 'generic',
          message: 'Please complete your wallet payment details.',
        })
        return
      }
    }
    /**
     * mapTransactionToCheckoutStatus - Utility function
     * @returns void
     */

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

    /**
     * pollTransactionStatus - Utility function
     * @returns void
     */
    let createdOrder: Awaited<ReturnType<typeof orderApis.createOrder>> | null = null
    let submittedWalletTxHash = ''

    try {
      /**
       * transactionId - Utility function
       * @returns void
       */
      const shippingAddr =
        checkoutValues.deliveryMethod !== 'pickup'
          ? {
              line1: checkoutValues.shippingAddress.addressLine1,
              line2: checkoutValues.shippingAddress.addressLine2 || undefined,
              city: checkoutValues.shippingAddress.city,
              state: checkoutValues.shippingAddress.state,
              postalCode: checkoutValues.shippingAddress.postalCode,
              country: checkoutValues.shippingAddress.country,
              /**
               * transaction - Utility function
               * @returns void
               */
            }
          : undefined

      createdOrder = await orderApis.createOrder({
        sellerId: artwork.artistId || '',
        items: [
          {
            artworkId: artwork.id,
            /**
             * nextStatus - Utility function
             * @returns void
             */
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

        /**
         * handleContinue - Utility function
         * @returns void
         */
        if (!intent.clientSecret) {
          throw new Error('Stripe did not return a payment confirmation token. Please try again.')
        }

        // Confirm card payment in-browser using the same Stripe account as the publishable key.
        const cardNumberEl = elements!.getElement(CardNumberElement)
        if (!cardNumberEl)
          /**
           * isStepValid - Utility function
           * @returns void
           */
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
          /**
           * paymentValues - Utility function
           * @returns void
           */
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

        const { txHash, walletAddress } = await submitWalletTransaction()
        submittedWalletTxHash = txHash

        if (
          !createdOrder ||
          Math.round(createdOrder.totalAmount * 100) !== Math.round(walletQuote.usdAmount * 100)
        ) {
          throw new Error('The checkout total changed. Refresh the Sepolia quote and try again.')
        }

        const recordedTransaction = await paymentApis.recordEthereumPayment({
          txHash,
          walletAddress,
          orderId: createdOrder.id,
          amount: walletQuote.usdAmount,
          currency: 'USD',
          quoteToken: walletQuote.quoteToken,
          chainId: walletQuote.chainId,
          description: `Purchase: ${artwork.title}`,
        })
        /**
         * walletState - Utility function
         * @returns void
         */

        const nextPaymentResult: CheckoutSuccessState = {
          artworkId,
          orderNumber: createdOrder.orderNumber,
          /**
           * walletAddressForValidation - Utility function
           * @returns void
           */
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
      /**
       * isStepValid - Utility function
       * @returns void
       */
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
        /**
         * checkoutValues - Utility function
         * @returns void
         */
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
    syncWalletState,
    stripe,
    walletQuote,
  ])
  /**
   * shippingAddr - Utility function
   * @returns void
   */

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
  /**
   * status - Utility function
   * @returns void
   */
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
            Go to Discover /** * amountInCents - Utility function * @returns void */
          </button>
        </div>
      </div>
    )
    /**
     * intent - Utility function
     * @returns void
     */
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
  /**
   * cardNumberEl - Utility function
   * @returns void
   */

  const isStep1Valid = contactForm.formState.isValid
  const isCardReady =
    watchedPaymentValues?.paymentMethod === 'card' &&
    Boolean(watchedPaymentValues.country?.trim()) &&
    cardElementsComplete
  /**
   * confirmation - Utility function
   * @returns void
   */
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
      /**
       * confirmedStatus - Utility function
       * @returns void
       */
      reservationMinutes={20}
      onCancel={handleCancel}
      onContinue={handleContinue}
      continueLabel={step === 1 ? 'Continue to Payment' : 'Pay Now'}
      isContinueDisabled={!isFormValid}
      isLoading={isLoading}
      orderSummary={
        <BuyerCheckoutOrderSummary
          /**
           * nextPaymentResult - Utility function
           * @returns void
           */
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
                  /**
                   * recordedTransaction - Utility function
                   * @returns void
                   */
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
              /**
               * nextPaymentResult - Utility function
               * @returns void
               */
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

/**
 * isWalletPayment - Utility function
 * @returns void
 */
/**
 * walletTxHash - Utility function
 * @returns void
 */
/**
 * handlePaymentRecovery - Utility function
 * @returns void
 */
/**
 * handleContinueShopping - Utility function
 * @returns void
 */
/**
 * isStep1Valid - Utility function
 * @returns void
 */
/**
 * isCardReady - Utility function
 * @returns void
 */
/**
 * isWalletReady - Utility function
 * @returns void
 */
/**
 * isStep2Valid - Utility function
 * @returns void
 */
/**
 * isFormValid - Utility function
 * @returns void
 */
