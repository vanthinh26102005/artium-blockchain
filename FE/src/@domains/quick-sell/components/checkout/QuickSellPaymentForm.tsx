// react
import { useCallback, useState } from 'react'
import { useRouter } from 'next/router'

// icons
import { CreditCard, Lock, ShieldCheck } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - quick-sell
import { mockPaymentAdapter } from '../../payments/mockPaymentAdapter'
import type { InvoicePaymentStatus } from '../../types/checkoutTypes'

type QuickSellPaymentFormProps = {
    invoiceCode: string
    total: number
    isFormValid: boolean
    onProcessingChange: (isProcessing: boolean) => void
}

/**
 * QuickSellPaymentForm - React component
 * @returns React element
 */
export const QuickSellPaymentForm = ({
    invoiceCode,
    total,
    isFormValid,
    onProcessingChange,
}: QuickSellPaymentFormProps) => {
    // -- router --
    const router = useRouter()

    // -- state --
/**
 * router - Utility function
 * @returns void
 */
    const [error, setError] = useState<string | null>(null)

    // -- handlers --
    const handlePayNow = useCallback(async () => {
        if (!isFormValid) return

        onProcessingChange(true)
        setError(null)

/**
 * handlePayNow - Utility function
 * @returns void
 */
        try {
            // 1. Create Payment Intent
            const intentResult = await mockPaymentAdapter.createPaymentIntent({
                invoiceCode,
                amount: total,
                currency: 'usd',
            })

            // 2. Construct Return URL (current page + params)
            const currentPath = window.location.pathname
            const returnUrl = new URL(currentPath, window.location.origin)
/**
 * intentResult - Utility function
 * @returns void
 */
            // We pass the current query params but will be overridden by adapter

            // 3. Confirm Payment (Simulates Redirect)
            await mockPaymentAdapter.confirmPayment({
                clientSecret: intentResult.clientSecret,
                returnUrl: returnUrl.toString(),
                paymentMethod: {
                    card: { token: 'tok_visa' }, // Mock token
                },
            })
/**
 * currentPath - Utility function
 * @returns void
 */

            // Note: Code below this might not execute if redirect happens
        } catch (err) {
            console.error('Payment failed:', err)
/**
 * returnUrl - Utility function
 * @returns void
 */
            setError('Payment failed. Please try again.')
            onProcessingChange(false)
        }
    }, [invoiceCode, total, isFormValid, onProcessingChange])

    // -- render --
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
                <div className="flex items-center gap-1 text-xs text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secure Encrypted</span>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                    {error}
                </div>
            )}

            {/* Mock Stripe Elements Container */}
            <div className="space-y-4">
                <div className="rounded-lg border border-slate-300 bg-slate-50 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-100">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-slate-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Credit or Debit Card</p>
                        </div>
                        <div className="flex gap-1">
                            {/* Card Icons */}
                            <div className="h-5 w-8 rounded bg-slate-200"></div>
                            <div className="h-5 w-8 rounded bg-slate-200"></div>
                        </div>
                    </div>

                    {/* Fake Input Fields for Realism */}
                    <div className="mt-4 grid gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                disabled
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white cursor-not-allowed text-slate-400"
                                placeholder="Card number"
                                value="•••• •••• •••• 4242"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                disabled
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white cursor-not-allowed text-slate-400"
                                placeholder="MM / YY"
                            />
                            <input
                                type="text"
                                disabled
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white cursor-not-allowed text-slate-400"
                                placeholder="CVC"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 text-xs text-slate-500">
                    <Lock className="h-3 w-3 mt-0.5" />
                    <span>
                        Payments are processed securely. This is a secure simulation environment.
                        No real charge will be made.
                    </span>
                </div>

                {/* Pay Button */}
                <Button
                    type="button"
                    onClick={handlePayNow}
                    disabled={!isFormValid}
                    className="w-full bg-blue-600 py-6 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-[1.01]"
                >
                    Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
                </Button>

                {!isFormValid && (
                    <p className="text-center text-sm text-amber-600 animate-pulse">
                        Please complete contact details above
                    </p>
                )}
            </div>
        </div>
    )
}
