// react
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

// icons
import { Plus, MoreHorizontal, Search, Eye, Trash2, Mail, ExternalLink, Edit2, Link2 } from 'lucide-react'

// shared
import { Button } from '@shared/components/ui/button'
import invoiceApis from '@shared/apis/invoiceApis'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'

// types & utils
import type { CheckoutInvoice } from '../types/checkoutTypes'
import { getAllStoredInvoices, deleteInvoiceFromStorage, saveInvoiceToStorage } from '../utils/checkoutStorage'
import { formatMoney } from '../utils/pricing'

import { QuickSellSendInvoiceModal } from '../components/modals/QuickSellSendInvoiceModal'

export const QuickSellInvoicesListView = () => {
    const router = useRouter()
    const [invoices, setInvoices] = useState<CheckoutInvoice[]>([])
    const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'DRAFT'>('ALL')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)

    // Send Modal State
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<CheckoutInvoice | null>(null)

    useEffect(() => {
        // Simulating fetch delay
        setTimeout(() => {
            const all = getAllStoredInvoices()
            setInvoices(all.reverse())
            setIsLoading(false)
        }, 500)
    }, [])

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'ALL') return true
        if (filter === 'PAID') return inv.status === 'PAID'
        if (filter === 'UNPAID') return inv.status === 'UNPAID' || !inv.status
        return true
    })

    const handleDelete = (code: string, id?: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            if (isUuid) {
                invoiceApis.deleteInvoice(id).catch(() => undefined)
            }
            deleteInvoiceFromStorage(code)
            setInvoices(prev => prev.filter(i => i.invoiceCode !== code))
        }
    }

    const handleOpenSendModal = (invoice: CheckoutInvoice) => {
        setSelectedInvoice(invoice)
        setIsSendModalOpen(true)
    }

    const handleSendInvoice = async (data: { name: string; email: string; message: string }) => {
        if (!selectedInvoice) return

        setIsSending(true)
        try {
            const invoiceUrl = `${window.location.origin}/artist/invoices/checkout/${selectedInvoice.invoiceCode}?buyer=true`
            await invoiceApis.sendQuickSellInvoice(selectedInvoice.invoiceCode, {
                ...data,
                invoiceUrl,
            })

            const updatedInvoice: CheckoutInvoice = {
                ...selectedInvoice,
                buyer: {
                    name: data.name,
                    email: data.email,
                    message: data.message,
                },
            }

            saveInvoiceToStorage(updatedInvoice)
            setInvoices(prev =>
                prev.map(inv =>
                    inv.invoiceCode === selectedInvoice.invoiceCode ? updatedInvoice : inv,
                ),
            )
            setSelectedInvoice(updatedInvoice)

            alert(`Invoice sent to ${data.email}!`)
        } catch (error) {
            console.error('Failed to send invoice:', error)
            alert('Failed to send invoice. Please try again.')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="-mx-6 -my-1 min-h-screen sm:-mx-8 lg:-mx-12 font-sans text-[#191414]">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-3xl leading-[120%] font-semibold text-slate-900">Invoices</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your art sales and invoices</p>
                </div>

                <Link href="/artist/invoices/create">
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-primary! text-primary! hover:bg-primary/10! border font-bold!"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create new invoice
                    </Button>
                </Link>
            </div>

            {/* Content Card */}
            <div className="mx-4 rounded-3xl border border-black/10 bg-white shadow-sm sm:mx-6 lg:mx-8">
                {/* Toolbar / Filters - Sticky Top */}
                <div className="sticky top-20 z-40 rounded-t-3xl border-b border-black/10 bg-white px-6 py-5">
                    <div className="flex items-center gap-2">
                        {['ALL', 'PAID', 'UNPAID'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`rounded-full px-5 py-2 text-[13px] font-bold transition-all ${filter === f
                                    ? 'bg-[#191414] text-white'
                                    : 'bg-[#F2F2F2] text-[#595959] hover:bg-[#E5E5E5]'
                                    }`}
                            >
                                {f === 'ALL' ? 'All Invoices' : f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Content */}
                <div className="px-6 py-6 pb-20">
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-20 text-[#595959]">Loading invoices...</div>
                        ) : filteredInvoices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5]">
                                    <Search className="h-8 w-8 text-[#989898]" />
                                </div>
                                <h3 className="text-[18px] font-bold text-[#191414]">No invoices found</h3>
                                <p className="mb-6 mt-2 max-w-[300px] text-[14px] text-[#595959]">
                                    Create your first invoice to start selling your artwork quickly and securely.
                                </p>
                                <Link href="/artist/invoices/create">
                                    <Button variant="outline" className="rounded-full border-[#E5E5E5] px-6 font-bold text-[#191414]">
                                        Create Invoice
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <InvoiceCard
                                    key={invoice.invoiceCode}
                                    invoice={invoice}
                                    onDelete={() => handleDelete(invoice.invoiceCode, invoice.id)}
                                    onSendClick={() => handleOpenSendModal(invoice)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <QuickSellSendInvoiceModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                invoice={selectedInvoice}
                onSend={handleSendInvoice}
                isSending={isSending}
            />
        </div>
    )
}

const InvoiceCard = ({
    invoice,
    onDelete,
    onSendClick
}: {
    invoice: CheckoutInvoice,
    onDelete: () => void,
    onSendClick: () => void
}) => {
    const artwork = invoice.items.find(i => i.type === 'artwork')

    // Check if paid
    const isPaid = invoice.status === 'PAID'

    return (
        <div className="rounded-[24px] bg-white p-6 shadow-sm border border-black/5 hover:border-black/10 transition group">
            {/* Top Row */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="h-[60px] w-[60px] overflow-hidden rounded-[12px] bg-[#F5F5F5] border border-[#E5E5E5]">
                        {artwork?.imageUrl ? (
                            <img src={artwork.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[20px]">🖼</div>
                        )}
                    </div>
                    {/* ID */}
                    <div>
                        <h3 className="text-[16px] font-bold text-[#191414] group-hover:text-blue-600 transition-colors">
                            Invoice #{invoice.invoiceCode}
                        </h3>
                        <p className="text-[13px] text-[#595959] mt-1">
                            Artist
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <Button
                        onClick={onSendClick}
                        className="h-[36px] gap-2 rounded-full bg-[#0066FF] px-4 text-[13px] font-bold text-white hover:bg-blue-700"
                    >
                        <Mail className="h-4 w-4" />
                        Send Invoice
                    </Button>

                    <Link
                        href={`/artist/invoices/checkout/${invoice.invoiceCode}?buyer=true`}
                        className="flex items-center gap-2 text-[14px] font-bold text-[#191414] transition hover:opacity-70"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View
                    </Link>

                    <Link
                        href={`/artist/invoices/edit/${invoice.invoiceCode}`}
                        className="flex items-center gap-2 text-[14px] font-bold text-[#191414] transition hover:opacity-70"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 text-[#191414] transition hover:opacity-50">
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-xl p-1.5">
                            <DropdownMenuItem
                                onClick={() => {
                                    const url = `${window.location.origin}/artist/invoices/checkout/${invoice.invoiceCode}?buyer=true`
                                    navigator.clipboard.writeText(url)
                                    alert('Link copied to clipboard!')
                                }}
                                className="cursor-pointer rounded-lg font-bold text-[#191414] focus:bg-[#F5F5F5]"
                            >
                                <Link2 className="mr-2 h-4 w-4" />
                                Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="cursor-pointer rounded-lg font-bold text-red-600 focus:bg-[#FFF5F5] focus:text-red-700"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Col 1 */}
                <div className="space-y-4">
                    <div className="flex justify-between md:block md:space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Items</p>
                        <p className="text-[14px] font-bold text-[#191414] truncate max-w-[200px]">
                            {artwork?.name || 'Untitled'}
                        </p>
                    </div>
                    <div className="flex justify-between md:block md:space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Total Order</p>
                        <p className="text-[14px] font-bold text-[#191414]">
                            {formatMoney(invoice.subtotal)}
                        </p>
                    </div>
                    <div className="flex justify-between md:block md:space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Order Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <p className="text-[14px] font-bold text-[#191414] capitalize">
                                {isPaid ? 'Paid' : (invoice.status?.toLowerCase() || 'open')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-4">
                    <div className="flex justify-between md:block md:space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Created On</p>
                        <p className="text-[14px] font-bold text-[#191414]">
                            Jan 23, 2026
                        </p>
                    </div>
                    <div className="flex justify-between md:block md:space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Sent to</p>
                        <p className="text-[14px] font-bold text-[#191414]">
                            {invoice.buyer?.email || '-'}
                        </p>
                    </div>
                    <div className="flex justify-between md:block md:space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">Last sent</p>
                        <p className="text-[14px] font-bold text-[#191414]">
                            -
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
