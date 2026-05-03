// react
import { ReactNode } from 'react'

// @domains - quick-sell
import { QuickSellHeader } from './layout/QuickSellHeader'
import { QuickSellFooter } from './layout/QuickSellFooter'

type QuickSellCreateInvoiceLayoutProps = {
    leftColumn: ReactNode
    rightColumn: ReactNode
    onCancel?: () => void
    onSaveDraft?: () => void
    onSendToBuyer?: () => void
    onTakePayment?: () => void
    isTakePaymentDisabled?: boolean
    isLoading?: boolean
    pageTitle?: string
}

/**
 * QuickSellCreateInvoiceLayout - React component
 * @returns React element
 */
export const QuickSellCreateInvoiceLayout = ({
    leftColumn,
    rightColumn,
    onCancel,
    onSaveDraft,
    onSendToBuyer,
    onTakePayment,
    isTakePaymentDisabled = false,
    isLoading = false,
    pageTitle = 'Create Invoice',
}: QuickSellCreateInvoiceLayoutProps) => {
    return (
        <div className="flex min-h-screen flex-col bg-white text-[#191414]">
            <QuickSellHeader title={pageTitle} />

            {/* Main content area - fixed height between header and footer */}
            <main className="fixed top-[60px] right-0 bottom-[60px] left-0 flex lg:top-[80px] lg:bottom-[80px]">
                {/* Left Column - Form (Fixed Width, Independent Scroll) */}
                <div className="w-full shrink-0 overflow-y-auto scrollbar-hide px-6 py-6 lg:w-[480px] lg:px-8 lg:py-8">
                    <div className="space-y-6 pb-4">{leftColumn}</div>
                </div>

                {/* Right Column - Preview (Expands to Fill, Centered Content) */}
                <div className="hidden flex-1 items-start justify-center overflow-y-auto scrollbar-hide border-l border-[#E5E5E5] bg-white px-6 py-6 lg:flex">
                    {rightColumn}
                </div>
            </main>

            <QuickSellFooter
                onCancel={onCancel}
                onSaveDraft={onSaveDraft}
                onSendToBuyer={onSendToBuyer}
                onTakePayment={onTakePayment}
                isTakePaymentDisabled={isTakePaymentDisabled}
                isSaveDisabled={isTakePaymentDisabled} // Using same validation flag logic for now, or add specific prop
                isLoading={isLoading}
            />
        </div>
    )
}


