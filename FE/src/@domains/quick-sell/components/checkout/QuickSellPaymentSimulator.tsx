// react
import { useCallback, useState } from 'react'

// icons
import { CreditCard, Lock } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - quick-sell
import type { InvoicePaymentStatus } from '../../types/checkoutTypes'

type QuickSellPaymentSimulatorProps = {
    status: InvoicePaymentStatus
    total: number
    onPayNow: () => void
    isFormValid: boolean
    isProcessing: boolean
}

export const QuickSellPaymentSimulator = ({
    status,
    total,
    onPayNow,
    isFormValid,
    isProcessing,
}: QuickSellPaymentSimulatorProps) => {
    // -- render --
    if (status === 'PAID') {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                <div className="mb-4 text-5xl">✓</div>
                <h2 className="text-2xl font-semibold text-green-900">Payment Complete</h2>
                <p className="mt-2 text-sm text-green-700">
                    Thank you for your purchase! You will receive a confirmation email shortly.
                </p>
                <div className="mt-6 rounded-lg bg-white p-4 text-left">
                    <h3 className="text-sm font-semibold text-slate-700">What happens next?</h3>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                        <li>• Order confirmation email sent</li>
                        <li>• Artist will ship your artwork within 3-5 business days</li>
                        <li>• Tracking number will be provided once shipped</li>
                    </ul>
                </div>
            </div>
        )
    }

    if (status === 'PENDING' || isProcessing) {
        return (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-12 w-12 animate-spin text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-blue-900">Processing Payment</h2>
                <p className="mt-2 text-sm text-blue-700">
                    Please wait while we process your payment securely...
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment</h2>

            {/* Simulated Card Input */}
            <div className="space-y-4">
                <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-slate-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">Credit or Debit Card</p>
                            <p className="text-xs text-slate-500">
                                Secure payment simulation (no real charge)
                            </p>
                        </div>
                    </div>

                    {/* Fake card number display */}
                    <div className="mt-4 space-y-3">
                        <div className="rounded border border-slate-300 bg-white px-3 py-2">
                            <p className="text-sm text-slate-400">•••• •••• •••• 4242</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded border border-slate-300 bg-white px-3 py-2">
                                <p className="text-sm text-slate-400">MM / YY</p>
                            </div>
                            <div className="rounded border border-slate-300 bg-white px-3 py-2">
                                <p className="text-sm text-slate-400">CVC</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Lock className="h-4 w-4" />
                    <span>Your payment info is secure. This is a simulation.</span>
                </div>

                {/* Pay Button */}
                <Button
                    type="button"
                    onClick={onPayNow}
                    disabled={!isFormValid || isProcessing}
                    className="w-full bg-blue-600 py-6 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                    Pay ${total.toFixed(2)}
                </Button>

                {!isFormValid && (
                    <p className="text-center text-sm text-amber-600">
                        Please fill in all required fields above
                    </p>
                )}
            </div>
        </div>
    )
}
