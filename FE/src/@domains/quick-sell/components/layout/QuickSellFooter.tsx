// icons
import { Save, Send, CreditCard } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'

type QuickSellFooterProps = {
    onCancel?: () => void
    onSaveDraft?: () => void
    onSendToBuyer?: () => void
    onTakePayment?: () => void
    isLoading?: boolean
    isTakePaymentDisabled?: boolean
    isSaveDisabled?: boolean
}

/**
 * QuickSellFooter - React component
 * @returns React element
 */
export const QuickSellFooter = ({
    onCancel,
    onSaveDraft,
    onSendToBuyer,
    onTakePayment,
    isLoading = false,
    isTakePaymentDisabled = false,
    isSaveDisabled = false,
}: QuickSellFooterProps) => {
    return (
        <footer className="fixed right-0 bottom-0 left-0 z-20 w-full bg-white border-t border-[#E5E5E5]">
            <div className="flex h-[60px] w-full items-center justify-between px-6 lg:h-[80px] lg:px-12">
                {/* Left: Cancel */}
                <div>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="h-[44px] rounded-full text-[14px] font-semibold text-[#595959] hover:bg-[#F5F5F5] hover:text-[#191414]"
                        >
                            Cancel
                        </Button>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {onSaveDraft && (
                        <Button
                            type="button"
                            onClick={onSaveDraft}
                            disabled={isLoading || isSaveDisabled}
                            className="h-[44px] gap-2 rounded-full bg-[#0066FF] px-6 text-[14px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            Save
                        </Button>
                    )}

                    {onTakePayment && (
                        <Button
                            type="button"
                            onClick={onTakePayment}
                            disabled={isLoading || isTakePaymentDisabled}
                            className="h-[44px] gap-2 rounded-full bg-[#E8F0FE] px-6 text-[14px] font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                        >
                            <CreditCard className="h-4 w-4" />
                            Collect Payment
                        </Button>
                    )}

                    {onSendToBuyer && (
                        <Button
                            type="button"
                            onClick={onSendToBuyer}
                            disabled={isLoading}
                            className="h-[44px] gap-2 rounded-full bg-blue-600 px-6 text-[14px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                            <Send className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </footer>
    )
}

