// react
import { ReactNode } from 'react'
import Link from 'next/link'

// icons
import { Lock, Trash2, Edit2, Link2, Mail, QrCode } from 'lucide-react'

// shared
import { Button } from '@shared/components/ui/button'

type QuickSellCheckoutLayoutProps = {
    invoiceCode: string
    sidebar: ReactNode
    content: ReactNode
    footer?: ReactNode
    onSendInvoice?: () => void
    onDelete?: () => void
}

/**
 * QuickSellCheckoutLayout - React component
 * @returns React element
 */
export const QuickSellCheckoutLayout = ({
    invoiceCode,
    sidebar,
    content,
    footer,
    onSendInvoice,
    onDelete,
}: QuickSellCheckoutLayoutProps) => {
    return (
        <div className="flex min-h-screen flex-col bg-[#F2F2F2] font-sans text-[#191414]">
            {/* Header - Fixed & Light */}
            <header className="fixed top-0 left-0 right-0 z-30 h-[80px] bg-[#F2F2F2]/80 backdrop-blur-md transition-all">
                <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 lg:px-12">
                    {/* Left: Invoice ID */}
                    <div>
                        <h1 className="text-[20px] font-bold text-[#191414] lg:text-[24px]">Invoice #{invoiceCode}</h1>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#595959] uppercase">
                            <Lock className="h-3 w-3" />
                            <span>SECURE CHECKOUT</span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {onSendInvoice && (
                            <Button
                                onClick={onSendInvoice}
                                className="hidden h-[40px] gap-2 rounded-full bg-[#E5E5E5] px-5 text-[14px] font-bold text-[#191414] hover:bg-[#D4D4D4] lg:flex border-none shadow-none"
                            >
                                <Mail className="h-4 w-4" />
                                Send Invoice
                            </Button>
                        )}
                        <div className="flex items-center gap-2">
                            <Link href={`/artist/invoices/edit/${invoiceCode}`}>
                                <button className="rounded-full p-2 text-[#191414] hover:bg-black/5 transition">
                                    <Edit2 className="h-5 w-5" />
                                </button>
                            </Link>
                            <button className="rounded-full p-2 text-[#191414] hover:bg-black/5 transition">
                                <QrCode className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/artist/invoices/checkout/${invoiceCode}?buyer=true`
                                    navigator.clipboard.writeText(url)
                                    alert('Link copied!')
/**
 * url - Utility function
 * @returns void
 */
                                }}
                                className="rounded-full p-2 text-[#191414] hover:bg-black/5 transition"
                            >
                                <Link2 className="h-5 w-5" />
                            </button>
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="rounded-full p-2 text-[#191414] hover:bg-red-50 hover:text-red-500 transition"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Scrollable Content */}
            <main className="flex-1 pt-[100px] pb-[120px] px-6 lg:px-12">
                <div className="mx-auto max-w-[1400px] bg-white rounded-4xl p-8 shadow-sm">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr]">
                        {/* Sidebar Column */}
                        <div className="flex flex-col gap-4">
                            {sidebar}
                        </div>

                        {/* Main Content Column */}
                        <div className="flex flex-col gap-4">
                            {content}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer - Fixed Bottom with Blur */}
            {footer && (
                <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-xl border-t border-black/5">
                    <div className="mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6 lg:px-12">
                        {footer}
                    </div>
                </footer>
            )}
        </div>
    )
}

