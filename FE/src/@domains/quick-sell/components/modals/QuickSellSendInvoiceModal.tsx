// react
import { useState, useEffect } from 'react'

// shared
import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'

// types
import type { CheckoutInvoice } from '../../types/checkoutTypes'

type QuickSellSendInvoiceModalProps = {
    isOpen: boolean
    onClose: () => void
    invoice: CheckoutInvoice | null
    onSend: (data: { name: string; email: string; message: string }) => void
    isSending?: boolean
}

/**
 * QuickSellSendInvoiceModal - React component
 * @returns React element
 */
export const QuickSellSendInvoiceModal = ({
    isOpen,
    onClose,
    invoice,
    onSend,
    isSending = false,
}: QuickSellSendInvoiceModalProps) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    // Reset/Prefill when opening
    useEffect(() => {
        if (isOpen && invoice) {
            setName(invoice.buyer?.name || '')
            setEmail(invoice.buyer?.email || '')
            setMessage(invoice.buyer?.message || '')
        }
    }, [isOpen, invoice])

    const handleSend = () => {
        onSend({ name, email, message })
        onClose()
/**
 * handleSend - Utility function
 * @returns void
 */
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] overflow-hidden rounded-3xl bg-white p-0 sm:max-w-[600px]">
                {/* Header */}
                <div className="relative pt-12 text-center">

                    <h2 className="text-[24px] font-bold text-[#191414]">Send Invoice to Buyer</h2>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 sm:px-12">
                    <p className="mt-4 text-center text-[15px] leading-relaxed text-[#191414]">
                        Enter the buyer's information to send this invoice. The buyer will receive an email with a secure link to view and pay the invoice.
                    </p>

                    <div className="mt-8 space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Buyer's Name
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-[50px] rounded-xl border border-[#E5E5E5] bg-white text-[15px] font-bold text-[#191414] placeholder:font-normal placeholder:text-[#989898] focus:border-blue-600 focus:ring-0"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-[50px] rounded-xl border border-[#E5E5E5] bg-white text-[15px] font-bold text-[#191414] placeholder:font-normal placeholder:text-[#989898] focus:border-blue-600 focus:ring-0"
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Message to Buyer
                            </label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message to the buyer (optional)"
                                className="min-h-[120px] resize-none rounded-xl border border-[#E5E5E5] bg-white p-4 text-[15px] font-medium text-[#191414] placeholder:font-normal placeholder:text-[#989898] focus:border-blue-600 focus:ring-0"
                                maxLength={2000}
                            />
                            <div className="flex justify-between text-[13px] text-[#989898]">
                                <span>This message will be included in the email sent to the buyer with the invoice.</span>
                                <span>{message.length}/2000 characters</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="h-[50px] flex-1 rounded-full border-[#E5E5E5] text-[15px] font-bold text-[#191414] hover:bg-[#F5F5F5]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!email || isSending}
                            className="h-[50px] flex-1 rounded-full bg-[#0066FF] text-[15px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSending ? 'Sending...' : 'Send Invoice'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
