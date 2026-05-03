// react
import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'

// icons
import { X, Clock } from 'lucide-react'

// shared
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

type BuyerCheckoutLayoutProps = {
    children: ReactNode
    orderSummary: ReactNode
    step?: number
    totalSteps?: number
    reservationMinutes?: number
    onCancel?: () => void
    onContinue?: () => void
    continueLabel?: string
    isContinueDisabled?: boolean
    isLoading?: boolean
}

/**
 * BuyerCheckoutLayout - React component
 * @returns React element
 */
export const BuyerCheckoutLayout = ({
    children,
    orderSummary,
    step = 1,
    totalSteps = 2,
    reservationMinutes = 20,
    onCancel,
    onContinue,
    continueLabel = 'Continue to Payment',
    isContinueDisabled = false,
    isLoading = false,
}: BuyerCheckoutLayoutProps) => {
    const progressPercent = Math.min(100, (step / totalSteps) * 100)

    // Countdown timer state
/**
 * progressPercent - Utility function
 * @returns void
 */
    const [timeLeft, setTimeLeft] = useState(reservationMinutes * 60) // in seconds

    useEffect(() => {
        // Reset timer when reservationMinutes changes
        setTimeLeft(reservationMinutes * 60)
    }, [reservationMinutes])

    useEffect(() => {
        if (timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
/**
 * timer - Utility function
 * @returns void
 */
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#FDFDFD] font-sans text-[#191414]">
            {/* Header - Full Width */}
/**
 * formatTime - Utility function
 * @returns void
 */
            <header className="fixed top-0 left-0 right-0 z-30 border-b border-black/10 bg-white">
                <div className="flex h-[60px] w-full items-center justify-center px-4 lg:h-[80px] lg:px-8">
                    {/* X Button - Far Left */}
                    <div className="absolute left-4 lg:left-8">
/**
 * mins - Utility function
 * @returns void
 */
                        <Link href="/">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#191414] transition hover:bg-black/5">
                                <X className="h-5 w-5" />
                            </button>
/**
 * secs - Utility function
 * @returns void
 */
                        </Link>
                    </div>

                    {/* Title - Centered */}
                    <h1 className="text-[16px] font-bold text-[#191414] lg:text-[22px]">Checkout</h1>
                </div>
            </header>

            {/* Reservation Timer - Full Width */}
            <div className="fixed top-[60px] left-0 right-0 z-20 border-b border-black/5 bg-[#F5F5F5] lg:top-[80px]">
                <div className="flex h-[40px] w-full items-center justify-center px-4 lg:h-12">
                    <div className="flex items-center gap-2 text-[13px] text-[#595959] lg:text-[14px]">
                        <Clock className="h-4 w-4" />
                        <span>
                            Your order is reserved for{' '}
                            <strong className={cn(timeLeft <= 60 && 'text-red-500')}>
                                {formatTime(timeLeft)}
                            </strong>{' '}
                            minutes
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content - Full Width with padding, added more top margin */}
            <main className="w-full px-4 pt-[140px] pb-[100px] lg:px-8 lg:pt-[160px] lg:pb-[120px]">
                <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
                    {/* Left Column - Forms */}
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:sticky lg:top-[180px] lg:self-start">
                        {orderSummary}
                    </div>
                </div>
            </main>

            {/* Footer - Full Width Edge to Edge */}
            <footer className="fixed bottom-0 left-0 right-0 z-20 w-full">
                <div className="flex h-[60px] w-full items-center justify-between gap-4 border-t border-black/10 bg-white px-4 py-4 lg:h-[80px] lg:px-8">
                    {/* Cancel/Previous - Far Left */}
                    <div className="flex flex-1 items-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-[40px] rounded-full border-black/10 px-6 text-[14px] font-semibold text-[#191414] hover:shadow disabled:opacity-40 lg:h-[44px]"
                        >
                            {step > 1 ? 'Previous' : 'Cancel'}
                        </Button>
                    </div>

                    {/* Step Indicator - Centered */}
                    <div className="flex flex-1 flex-col items-center justify-center gap-1 lg:gap-2">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[#191414]/60 lg:text-[14px]">
                            Step {step} of {totalSteps}
                        </span>
                        <div className="h-1.5 w-32 rounded-full bg-blue-100 lg:h-2 lg:w-48">
                            <div
                                className={cn(
                                    'h-full rounded-full bg-[#0066FF] transition-all duration-500 ease-out',
                                    progressPercent === 0 && 'w-0',
                                )}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Continue - Far Right */}
                    <div className="flex flex-1 items-center justify-end">
                        <Button
                            type="button"
                            onClick={onContinue}
                            disabled={isContinueDisabled || isLoading}
                            className="h-[40px] rounded-full bg-[#0066FF] px-6 text-[14px] font-semibold text-white hover:bg-blue-700 hover:shadow disabled:opacity-40 lg:h-[44px]"
                        >
                            {isLoading ? 'Processing...' : continueLabel}
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
