// next
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'

// stripe
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { Elements, ElementsConsumer, PaymentElement } from '@stripe/react-stripe-js'

// quick-sell types
import type { CheckoutInvoice } from '../types/checkoutTypes'
import { mapInvoiceResponseToCheckoutInvoice } from '../utils/mapInvoiceResponse'
import { getInvoiceFromStorage, saveInvoiceToStorage } from '../utils/checkoutStorage'

// shared
import invoiceApis from '@shared/apis/invoiceApis'

// auth
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export type CheckoutInvoicePageViewProps = {
    invoiceCode: string
    quickSellInvoiceJustCreated?: boolean
}

export const CheckoutInvoicePageView: FC<CheckoutInvoicePageViewProps> = ({
    invoiceCode,
    quickSellInvoiceJustCreated,
}) => {
    const router = useRouter()
    const { redirect_status } = router.query
    const stripeRef = useRef<Stripe | null>(null)
    const elementsRef = useRef<StripeElements | null>(null)
    const user = useAuthStore((state) => state.user)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    const stripePromise = useMemo(() => {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        return key ? loadStripe(key) : null
    }, [])

    // -- state --
    const [isLoading, setIsLoading] = useState(true)
    const [invoice, setInvoice] = useState<CheckoutInvoice | null>(null)
    const [viewMode, setViewMode] = useState<'artist' | 'buyer'>('artist')
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentError, setPaymentError] = useState<string | null>(null)

    // -- derived --
    const isArtistView = viewMode === 'artist'
    const isPaid = invoice?.status === 'PAID'
    const payButtonLabel = clientSecret ? 'Complete Payment' : 'Pay Now'

    useEffect(() => {
        let isMounted = true

        const loadInvoice = async () => {
            try {
                const apiInvoice = await invoiceApis.getInvoiceByCode(invoiceCode)
                const mapped = mapInvoiceResponseToCheckoutInvoice(apiInvoice)
                if (!isMounted) return
                setInvoice(mapped)
                saveInvoiceToStorage(mapped)
            } catch {
                const stored = getInvoiceFromStorage(invoiceCode)
                if (stored && isMounted) {
                    setInvoice(stored)
                }
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadInvoice()

        return () => {
            isMounted = false
        }
    }, [invoiceCode])

    // -- handlers --
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

        const buyerEmail = invoice.buyer?.email || user?.email
        if (!buyerEmail) {
            setPaymentError('Please provide a buyer email before paying.')
            return
        }

        try {
            setIsProcessing(true)
            setPaymentError(null)

            if (!clientSecret) {
                const intent = await invoiceApis.createQuickSellPaymentIntent(invoice.invoiceCode, {
                    email: buyerEmail,
                    name: invoice.buyer?.name || user?.username || 'N/A',
                })
                setClientSecret(intent.clientSecret)
                setIsProcessing(false)
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
                const updatedInvoice = { ...invoice, status: 'PAID' as const }
                setInvoice(updatedInvoice)
                saveInvoiceToStorage(updatedInvoice)
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
    }, [invoice, stripePromise, isAuthenticated, router, user?.email, user?.username, clientSecret])

    // -- render --
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
                Loading invoice...
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex min-h-screen items-center justify-center flex-col gap-2">
                <h1 className="text-lg font-semibold text-slate-900">Invoice not found</h1>
                <p className="text-sm text-slate-500">Please check the link or contact the seller.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-4">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Invoice {invoice.invoiceCode}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Status: <span className="font-medium">{invoice.status}</span>
                        </p>
                    </div>

                    {/* DEV: View Mode Toggle */}
                    <div className="rounded-lg border border-slate-300 bg-slate-100 p-1">
                        <button
                            onClick={() => setViewMode('artist')}
                            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${isArtistView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                }`}
                        >
                            Artist View
                        </button>
                        <button
                            onClick={() => setViewMode('buyer')}
                            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${!isArtistView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                                }`}
                        >
                            Buyer View
                        </button>
                    </div>
                </div>

                {quickSellInvoiceJustCreated && (
                    <div className="mx-auto mt-3 max-w-4xl rounded-md bg-green-50 p-3">
                        <p className="text-sm text-green-800">✓ Invoice created successfully!</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-4xl px-6 py-8">
                {/* Artist View */}
                {isArtistView && (
                    <div className="space-y-6">
                        {/* Quick Sell QR Code Section */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Sell</h2>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                                    <span className="text-sm text-slate-500">QR Code</span>
                                </div>
                                <div className="flex gap-3">
                                    <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        Copy Link
                                    </button>
                                    <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                        Enter Payment for Buyer
                                    </button>
                                </div>
                            </div>
                            <p className="mt-3 text-center text-sm text-slate-500">
                                QR Modal coming in PR2
                            </p>
                        </div>

                        {/* Invoice Summary */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Invoice Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Buyer:</span>
                                    <span className="font-medium text-slate-900">
                                        {invoice.buyer?.name || 'Not specified'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Email:</span>
                                    <span className="font-medium text-slate-900">
                                        {invoice.buyer?.email || 'Not specified'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Items:</span>
                                    <span className="font-medium text-slate-900">{invoice.items.length}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className="text-slate-900">Total:</span>
                                        <span className="text-slate-900">${invoice.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buyer View */}
                {!isArtistView && (
                    <div className="space-y-6">
                        {/* Paid State */}
                        {isPaid ? (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                                <div className="mb-4 text-5xl">✓</div>
                                <h2 className="text-2xl font-semibold text-green-900">Payment Complete</h2>
                                <p className="mt-2 text-sm text-green-700">
                                    This invoice has been paid. Thank you!
                                </p>
                            </div>
                        ) : (
                            <>
                                {redirect_status === 'failed' && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <p className="font-medium text-red-900">Payment Failed</p>
                                        <p className="text-sm text-red-700">Please try again or use a different card.</p>
                                    </div>
                                )}
                                {redirect_status === 'success' && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <p className="font-medium text-green-900">Payment Processing</p>
                                        <p className="text-sm text-green-700">Your payment is being confirmed.</p>
                                    </div>
                                )}
                                {/* Buyer Information Form Placeholder */}
                                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                        Contact Information
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                        <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-500">Form inputs coming in PR2</p>
                                </div>

                                {/* Shipping Address Placeholder */}
                                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                        Shipping Address
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                        <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                        <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-500">
                                        Shipping form coming in PR2
                                    </p>
                                </div>

                                {/* Payment Form Placeholder */}
                                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h2>
                                    {!stripePromise && (
                                        <p className="text-sm text-slate-500">
                                            Stripe is not configured. Please try again later.
                                        </p>
                                    )}
                                    {stripePromise && (
                                        <div className="space-y-4">
                                            {clientSecret ? (
                                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                    <ElementsConsumer>
                                                        {({ stripe, elements }) => {
                                                            if (stripe) stripeRef.current = stripe
                                                            if (elements) elementsRef.current = elements
                                                            return <PaymentElement />
                                                        }}
                                                    </ElementsConsumer>
                                                </Elements>
                                            ) : (
                                                <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                                    Click “Pay Now” to start the secure checkout.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {paymentError && (
                                        <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                            {paymentError}
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Subtotal:</span>
                                            <span className="text-slate-900">${invoice.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Tax:</span>
                                            <span className="text-slate-900">${invoice.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Shipping:</span>
                                            <span className="text-slate-900">${invoice.shipping.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span className="text-slate-900">Total:</span>
                                                <span className="text-slate-900">${invoice.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                        onClick={handlePayNow}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : payButtonLabel}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
