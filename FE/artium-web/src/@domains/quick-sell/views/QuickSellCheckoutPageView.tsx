// react
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'

// stripe
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { Elements, ElementsConsumer, PaymentElement } from '@stripe/react-stripe-js'

// @domains - quick-sell
import { QuickSellCheckoutLayout } from '../components/QuickSellCheckoutLayout'
import { QuickSellCheckoutSidebar } from '../components/checkout/QuickSellCheckoutSidebar'
import { QuickSellCheckoutMainContent } from '../components/checkout/QuickSellCheckoutMainContent'
import { QuickSellArtistSharePanel } from '../components/checkout/QuickSellArtistSharePanel'
import { QuickSellCheckoutStatusBanner } from '../components/checkout/QuickSellCheckoutStatusBanner'
import { QuickSellPaidState } from '../components/checkout/QuickSellPaidState'

// shared
import { Button } from '@shared/components/ui/button'
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import invoiceApis from '@shared/apis/invoiceApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

// types & utils
import type { CheckoutInvoice, CheckoutDraft } from '../types/checkoutTypes'
import { defaultCheckoutDraft } from '../types/checkoutTypes'
import {
    getInvoiceFromStorage,
    updateInvoiceStatus,
    getCheckoutDraft,
    saveCheckoutDraft,
    deleteInvoiceFromStorage,
    saveInvoiceToStorage,
} from '../utils/checkoutStorage'
import { calculateMockShipping, calculateMockTax, isAddressValidForPricing } from '../utils/mockPricingServices'
import { mapInvoiceResponseToCheckoutInvoice } from '../utils/mapInvoiceResponse'
import {
    quickSellCheckoutFormSchema,
    type QuickSellCheckoutFormValues,
} from '../validations/quickSellCheckout.schema'

type QuickSellCheckoutPageViewProps = {
    invoiceCode: string
    isBuyerMode?: boolean
    isPending?: boolean
    quickSellInvoiceJustCreated?: boolean
}

export const QuickSellCheckoutPageView = ({
    invoiceCode,
    isBuyerMode = false,
    isPending = false,
}: QuickSellCheckoutPageViewProps) => {
    // -- router --
    const router = useRouter()
    const { redirect_status } = router.query
    const stripeRef = useRef<Stripe | null>(null)
    const elementsRef = useRef<StripeElements | null>(null)
    const user = useAuthStore((state) => state.user)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    // -- state --
    const [isLoading, setIsLoading] = useState(true)
    const [invoice, setInvoice] = useState<CheckoutInvoice | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentError, setPaymentError] = useState<string | null>(null)
    const checkoutForm = useForm<QuickSellCheckoutFormValues>({
        resolver: zodResolver(quickSellCheckoutFormSchema),
        defaultValues: {
            address: defaultCheckoutDraft.address,
            deliveryMethod: 'pickup',
            paymentCountry: 'VN',
        },
        mode: 'onChange',
    })
    const watchedAddress = useWatch({ control: checkoutForm.control, name: 'address' })
    const checkoutAddress: CheckoutDraft['address'] = useMemo(() => ({
        ...defaultCheckoutDraft.address,
        ...watchedAddress,
    }), [watchedAddress])

    const stripePromise = useMemo(() => {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        if (!key || typeof window === 'undefined') return null
        return loadStripe(key)
    }, [])

    // -- effects --
    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            try {
                const apiInvoice = await invoiceApis.getInvoiceByCode(invoiceCode)
                const mappedInvoice = mapInvoiceResponseToCheckoutInvoice(apiInvoice)

                if (!isMounted) return
                setInvoice(mappedInvoice)
                saveInvoiceToStorage(mappedInvoice)
            } catch {
                const storedInvoice = getInvoiceFromStorage(invoiceCode)
                if (storedInvoice && isMounted) {
                    setInvoice(storedInvoice)
                }
            } finally {
                const storedDraft = getCheckoutDraft(invoiceCode)
                if (storedDraft && isMounted) {
                    checkoutForm.reset({
                        ...checkoutForm.getValues(),
                        address: storedDraft.address,
                    })
                }
                if (isMounted) setIsLoading(false)
            }
        }

        setTimeout(() => {
            loadData()
        }, 300)

        return () => {
            isMounted = false
        }
    }, [checkoutForm, invoiceCode])

    // -- effect: handle pending state from payment return --
    useEffect(() => {
        if (isPending && invoice && invoice.status !== 'PAID') {
            const updated = updateInvoiceStatus(invoiceCode, 'PENDING')
            if (updated) setInvoice(updated)

            // Polling simulation: check after 2s if it's paid
            const timer = setTimeout(() => {
                const paidInvoice = updateInvoiceStatus(invoiceCode, 'PAID')
                if (paidInvoice) setInvoice(paidInvoice)

                // Clean up URL
                router.replace(
                    `/artist/invoices/checkout/${invoiceCode}?buyer=true`,
                    undefined,
                    { shallow: true }
                )
            }, 2500)

            return () => clearTimeout(timer)
        }
    }, [isPending, invoice, invoiceCode, router])

    useEffect(() => {
        const nextDraft: CheckoutDraft = {
            address: checkoutAddress,
            shippingFee: 0,
            taxPercent: 0,
            taxAmount: 0,
        }

        if (invoice && isAddressValidForPricing(checkoutAddress)) {
            const subtotalAfterDiscount = invoice.subtotal - invoice.discountTotal
            const shippingFee = calculateMockShipping(checkoutAddress, subtotalAfterDiscount)
            const { ratePercent, taxAmount } = calculateMockTax(
                checkoutAddress.postalCode,
                checkoutAddress.state,
                subtotalAfterDiscount,
                shippingFee,
            )

            nextDraft.shippingFee = shippingFee
            nextDraft.taxPercent = ratePercent
            nextDraft.taxAmount = taxAmount
        }

        saveCheckoutDraft(invoiceCode, nextDraft)
    }, [checkoutAddress, invoice, invoiceCode])

    useEffect(() => {
        if (!paymentError) return

        const subscription = checkoutForm.watch(() => {
            setPaymentError(null)
        })

        return () => subscription.unsubscribe()
    }, [checkoutForm, paymentError])

    const totals = useMemo(() => {
        if (!invoice) return { subtotal: 0, discountTotal: 0, shipping: 0, taxPercent: 0, tax: 0, total: 0 }

        const subtotal = invoice.subtotal
        const discountTotal = invoice.discountTotal
        const subtotalAfterDiscount = subtotal - discountTotal

        let shipping = 0
        let taxPercent = 0
        let tax = 0

        if (isAddressValidForPricing(checkoutAddress)) {
            shipping = calculateMockShipping(checkoutAddress, subtotalAfterDiscount)
            const taxResult = calculateMockTax(
                checkoutAddress.postalCode,
                checkoutAddress.state,
                subtotalAfterDiscount,
                shipping,
            )
            taxPercent = taxResult.ratePercent
            tax = taxResult.taxAmount
        }

        return {
            subtotal,
            discountTotal,
            shipping,
            taxPercent,
            tax,
            total: subtotalAfterDiscount + shipping + tax
        }
    }, [checkoutAddress, invoice])

    const handleSendInvoice = () => {
        alert('Invoice sent!')
    }

    const handleExit = () => {
        router.push('/artist/invoices')
    }

    const handleDelete = useCallback(() => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            const isUuid = invoice?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoice.id)
            if (isUuid) {
                invoiceApis.deleteInvoice(invoice.id).catch(() => undefined)
            }
            deleteInvoiceFromStorage(invoiceCode)
            router.push('/artist/invoices')
        }
    }, [invoiceCode, router, invoice?.id])

    const handlePayNow = useCallback(async () => {
        if (!invoice) return
        if (!stripePromise) {
            setPaymentError('Stripe is not configured.')
            return
        }

        if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(router.asPath)
            router.push(`/login?returnUrl=${returnUrl}`)
            return
        }

        const isFormValid = await checkoutForm.trigger()
        if (!isFormValid) {
            setPaymentError('Please complete contact and shipping details to continue.')
            return
        }

        const checkoutValues = checkoutForm.getValues()
        const draftEmail = checkoutValues.address.email?.trim()
        const buyerEmail = draftEmail || invoice.buyer?.email || user?.email
        const buyerName = checkoutValues.address.firstName || checkoutValues.address.lastName
            ? `${checkoutValues.address.firstName} ${checkoutValues.address.lastName}`.trim()
            : invoice.buyer?.name || user?.username || undefined

        if (!buyerEmail) {
            setPaymentError('Please provide an email address to continue.')
            return
        }

        try {
            setIsProcessing(true)
            setPaymentError(null)

            if (!clientSecret) {
                const intent = await invoiceApis.createQuickSellPaymentIntent(invoice.invoiceCode, {
                    email: buyerEmail,
                    name: buyerName,
                })
                setClientSecret(intent.clientSecret)
                return
            }

            const stripe = stripeRef.current
            const elements = elementsRef.current
            if (!stripe || !elements) {
                setPaymentError('Payment form is not ready yet.')
                return
            }

            const returnUrl = `${window.location.origin}/artist/invoices/checkout/${invoice.invoiceCode}?buyer=true&redirect_status=success`
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: { return_url: returnUrl },
                redirect: 'if_required',
            })

            if (result.error) {
                setPaymentError(result.error.message || 'Payment failed. Please try again.')
                return
            }

            if (result.paymentIntent?.status === 'succeeded') {
                const updated = { ...invoice, status: 'PAID' as const }
                setInvoice(updated)
                saveInvoiceToStorage(updated)
            }
        } catch (error) {
            const message =
                error && typeof error === 'object' && 'message' in error
                    ? String((error as { message?: string }).message)
                    : 'Payment failed. Please try again.'
            setPaymentError(message)
        } finally {
            setIsProcessing(false)
        }
    }, [
        invoice,
        stripePromise,
        isAuthenticated,
        router,
        checkoutForm,
        clientSecret,
        user?.email,
        user?.username,
    ])

    // -- LOADING --
    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>
    }

    // -- NOT FOUND --
    if (!invoice) {
        return (
            <div className="flex min-h-screen items-center justify-center flex-col gap-4">
                <h1 className="text-xl font-semibold">Invoice Not Found</h1>
                <Link href="/artist/invoices/create" className="text-blue-600 underline">Create New</Link>
            </div>
        )
    }

    const isArtistMode = !isBuyerMode
    const status = invoice.status || 'UNPAID'

    // -- PAID STATE --
    if (status === 'PAID') {
        return (
            <QuickSellCheckoutLayout
                invoiceCode={invoice.invoiceCode}
                sidebar={
                    <QuickSellCheckoutSidebar invoice={invoice} totals={totals} />
                }
                content={
                    <QuickSellPaidState
                        invoiceCode={invoice.invoiceCode}
                        items={invoice.items}
                        totals={totals}
                    />
                }
            />
        )
    }

    // -- ARTIST MODE --
    if (isArtistMode) {
        return (
            <QuickSellCheckoutLayout
                invoiceCode={invoice.invoiceCode}
                onSendInvoice={handleSendInvoice}
                onDelete={handleDelete}
                sidebar={
                    <QuickSellCheckoutSidebar
                        invoice={invoice}
                        totals={totals}
                    />
                }
                content={
                    <div className="space-y-8">
                        {/* Status Banner */}
                        <QuickSellCheckoutStatusBanner status={status} invoiceCode={invoice.invoiceCode} />

                        {/* Artist specific: Share Panel */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                            <QuickSellArtistSharePanel
                                invoiceCode={invoice.invoiceCode}
                                onEnterPaymentForBuyer={() => router.push(`/artist/invoices/checkout/${invoiceCode}?buyer=true`)}
                            />
                        </div>

                        {/* Preview of what buyer sees */}
                        <div className="opacity-75 pointer-events-none relative select-none">
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <span className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">Buyer View Preview</span>
                            </div>
                            <FormProvider {...checkoutForm}>
                                <QuickSellCheckoutMainContent
                                    paymentError={paymentError}
                                />
                            </FormProvider>
                        </div>
                    </div>
                }
            />
        )
    }

    // -- BUYER MODE --
    return (
        <>
            <QuickSellCheckoutLayout
                invoiceCode={invoice.invoiceCode}
                sidebar={
                    <QuickSellCheckoutSidebar
                        invoice={invoice}
                        totals={totals}
                    />
                }
                content={
                    <div className="space-y-6">
                        {/* Payment Failed Banner */}
                        {redirect_status === 'failed' && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
                                <p className="font-medium text-red-900">Payment Failed</p>
                                <p className="text-sm text-red-700">Please try again or use a different card.</p>
                            </div>
                        )}

                        <FormProvider {...checkoutForm}>
                            <QuickSellCheckoutMainContent
                                paymentElement={
                                    stripePromise && clientSecret ? (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <ElementsConsumer>
                                                {({ stripe, elements }) => {
                                                    if (stripe) stripeRef.current = stripe
                                                    if (elements) elementsRef.current = elements
                                                    return <PaymentElement />
                                                }}
                                            </ElementsConsumer>
                                        </Elements>
                                    ) : null
                                }
                                paymentPlaceholder={
                                    !stripePromise ? (
                                        <div className="rounded-2xl border border-[#E5E5E5] bg-[#FCFCFC] p-4 text-[13px] text-[#595959]">
                                            Stripe is not configured yet. Please try again later.
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-[#E5E5E5] bg-[#FCFCFC] p-4 text-[13px] text-[#595959]">
                                            Click “Pay Now” to start the secure checkout.
                                        </div>
                                    )
                                }
                                paymentError={paymentError}
                            />
                        </FormProvider>
                    </div>
                }
                footer={
                    <>
                        <Button
                            variant="ghost"
                            className="h-[44px] rounded-full text-[14px] font-bold text-[#191414] hover:bg-[#F5F5F5]"
                            onClick={() => setShowCancelModal(true)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-[44px] rounded-full bg-[#0066FF] px-8 text-[14px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                            onClick={handlePayNow}
                            disabled={isProcessing || !stripePromise}
                        >
                            {isProcessing ? 'Processing...' : clientSecret ? 'Complete Payment' : 'Pay Now'}
                        </Button>
                    </>
                }
            />

            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
                    <div className="px-8 py-6">
                        <h2 className="text-[22px] font-bold text-[#191414] uppercase">
                            ARE YOU SURE YOU WANT TO EXIT?
                        </h2>
                        <p className="mt-4 text-[18px] text-[#191414]">
                            If you leave this page, your information won&apos;t be saved
                        </p>
                    </div>
                    <div className="grid grid-cols-2 border-t border-black/10 text-[18px] font-semibold">
                        <button
                            type="button"
                            onClick={() => setShowCancelModal(false)}
                            className="px-6 py-5 text-center text-[#191414] transition hover:bg-black/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleExit}
                            className="border-l border-black/10 px-6 py-5 text-center text-red-500 transition hover:bg-red-50"
                        >
                            Yes, exit flow
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
