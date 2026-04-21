// react
import { useCallback, useEffect, useMemo, useState } from 'react'

// next
import { useRouter } from 'next/router'

// @domains - quick-sell
import { QuickSellCreateInvoiceLayout } from '../components/QuickSellCreateInvoiceLayout'
import { QuickSellInvoiceForm } from '../components/create/QuickSellInvoiceForm'
import { QuickSellInvoicePreview } from '../components/create/QuickSellInvoicePreview'
import { useCreateQuickSellInvoice } from '../hooks/useCreateQuickSellInvoice'
import invoiceApis from '@shared/apis/invoiceApis'
import { defaultInvoiceDraft } from '../types/quickSellDraft'
import type { QuickSellInvoiceDraft } from '../types/quickSellDraft'
import { canSubmitDraft } from '../types/quickSellValidation'
import { calculateInvoiceTotals } from '../utils/pricing'
import { getInvoiceFromStorage, saveInvoiceToStorage } from '../utils/checkoutStorage'
import type { CheckoutInvoice } from '../types/checkoutTypes'
import { mapInvoiceResponseToCheckoutInvoice } from '../utils/mapInvoiceResponse'
import { mapUpdateInvoicePayload } from '../utils/mapUpdateInvoicePayload'

// @shared - components
import { Dialog, DialogContent } from '@shared/components/ui/dialog'

type QuickSellCreateInvoicePageViewProps = {
    artworkId?: string
    invoiceCode?: string
}

export const QuickSellCreateInvoicePageView = ({
    artworkId,
    invoiceCode,
}: QuickSellCreateInvoicePageViewProps) => {
    // -- router --
    const router = useRouter()

    // -- hooks --
    const { createInvoice, isLoading: isCreating, error, reset } = useCreateQuickSellInvoice()

    // -- state --
    const [draft, setDraft] = useState<QuickSellInvoiceDraft>(defaultInvoiceDraft)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [existingInvoice, setExistingInvoice] = useState<CheckoutInvoice | null>(null)
    const [isModelsLoading, setIsModelsLoading] = useState(!!invoiceCode)

    // -- derived --
    const isEditMode = !!invoiceCode
    const totals = useMemo(() => calculateInvoiceTotals(draft), [draft])
    const isValid = useMemo(() => canSubmitDraft(draft), [draft])
    const isLoading = isCreating || isModelsLoading

    // -- effect: load invoice data for edit --
    useEffect(() => {
        let isMounted = true

        const mapCheckoutInvoiceToDraft = (invoice: CheckoutInvoice): QuickSellInvoiceDraft => ({
            items: invoice.items.map(item => {
                if (item.type === 'artwork') {
                    return {
                        id: item.id,
                        type: 'artwork',
                        artworkId: item.artworkId || item.id,
                        artworkName: item.artworkName || item.name,
                        price: item.price,
                        quantity: item.quantity,
                        discountPercent: item.discountPercent,
                        artworkImageUrl: item.artworkImageUrl || item.imageUrl,
                    }
                }
                return {
                    id: item.id,
                    type: 'custom',
                    title: item.title || item.name,
                    price: item.price,
                    quantity: item.quantity,
                    discountPercent: item.discountPercent,
                }
            }),
            buyer: {
                name: invoice.buyer?.name || '',
                email: invoice.buyer?.email || '',
                message: invoice.buyer?.message || '',
            },
            isApplySalesTax: invoice.taxPercent > 0,
            taxPercent: invoice.taxPercent > 0 ? invoice.taxPercent : 0,
            taxZipCode: '',
            shippingFee: invoice.shipping,
            isArtistHandlesShipping: true,
        })

        const loadInvoice = async () => {
            if (!invoiceCode) return
            try {
                const apiInvoice = await invoiceApis.getInvoiceByCode(invoiceCode)
                const checkoutInvoice = mapInvoiceResponseToCheckoutInvoice(apiInvoice)
                if (!isMounted) return
                setExistingInvoice(checkoutInvoice)
                setDraft(mapCheckoutInvoiceToDraft(checkoutInvoice))
                saveInvoiceToStorage(checkoutInvoice)
            } catch (err) {
                const invoice = getInvoiceFromStorage(invoiceCode)
                if (invoice && isMounted) {
                    setExistingInvoice(invoice)
                    setDraft(mapCheckoutInvoiceToDraft(invoice))
                }
            } finally {
                if (isMounted) setIsModelsLoading(false)
            }
        }

        loadInvoice()

        return () => {
            isMounted = false
        }
    }, [invoiceCode])

    // -- handlers --
    const handleDraftChange = useCallback((newDraft: QuickSellInvoiceDraft) => {
        setDraft(newDraft)
        // Clear any previous error when user makes changes
        if (error) {
            reset()
        }
    }, [error, reset])

    const handleCancel = useCallback(() => {
        setShowCancelModal(true)
    }, [])

    const handleConfirmCancel = useCallback(() => {
        // Redirect back to list
        router.push('/artist/invoices')
    }, [router])

    const handleSave = useCallback(async () => {
        if (!isValid || isLoading) return

        try {
            if (isEditMode && existingInvoice) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existingInvoice.id)
                if (isUuid) {
                    const payload = mapUpdateInvoicePayload(draft)
                    await invoiceApis.updateInvoice(existingInvoice.id, payload)
                    const resolvedCode = invoiceCode || existingInvoice.invoiceCode
                    if (resolvedCode) {
                        const refreshed = await invoiceApis.getInvoiceByCode(resolvedCode)
                        const updatedInvoice = mapInvoiceResponseToCheckoutInvoice(refreshed)
                        saveInvoiceToStorage(updatedInvoice)
                    }
                } else {
                    // Fallback to local update if invoice id isn't a backend id
                    const updatedInvoice: CheckoutInvoice = {
                        ...existingInvoice,
                        items: draft.items.map((item, i) => ({
                            id: item.id || `item-${Date.now()}-${i}`,
                            type: item.type,
                            name: item.type === 'artwork' ? item.artworkName : item.title,
                            price: item.price,
                            quantity: item.quantity,
                            discountPercent: item.discountPercent,
                            imageUrl: item.type === 'artwork' ? item.artworkImageUrl : undefined,
                        })),
                        buyer: draft.buyer.name ? {
                            name: draft.buyer.name,
                            email: draft.buyer.email,
                            message: draft.buyer.message,
                        } : undefined,
                        subtotal: totals.subtotal,
                        discountTotal: totals.discountTotal,
                        taxPercent: draft.isApplySalesTax ? (draft.taxPercent ?? 0) : 0,
                        tax: totals.tax,
                        total: totals.total,
                    }

                    saveInvoiceToStorage(updatedInvoice)
                }
                router.push('/artist/invoices')
            } else {
                // Create Logic
                await createInvoice(draft)
                router.push('/artist/invoices')
            }
        } catch (err) {
            console.error('Failed to save invoice:', err)
        }
    }, [draft, isValid, isLoading, createInvoice, router, isEditMode, existingInvoice, totals, invoiceCode])

    // -- render --
    const leftColumn = (
        <>
            {/* Error Banner */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        <p className="text-sm font-medium text-red-800">
                            Failed to create invoice
                        </p>
                    </div>
                    <p className="mt-1 text-sm text-red-600">{error.message}</p>
                    <button
                        type="button"
                        onClick={reset}
                        className="mt-2 text-sm text-red-700 underline hover:no-underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <QuickSellInvoiceForm
                draft={draft}
                onChange={handleDraftChange}
            />
        </>
    )

    const rightColumn = (
        <QuickSellInvoicePreview
            draft={draft}
            totals={totals}
        />
    )

    return (
        <>
            <QuickSellCreateInvoiceLayout
                pageTitle={isEditMode ? 'Edit Invoice' : 'Create Invoice'}
                leftColumn={leftColumn}
                rightColumn={rightColumn}
                onCancel={handleCancel}
                onSaveDraft={handleSave}
                isLoading={isLoading}
            />

            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent size="4xl" className="overflow-hidden rounded-[32px] bg-white p-0">
                    <div className="px-8 py-6">
                        <h2 className="text-[22px] font-bold text-[#191414] uppercase">Discard Changes?</h2>
                        <p className="mt-4 text-[18px] text-[#191414]">
                            Are you sure you want to discard your changes? All unsaved progress will be lost.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 border-t border-black/10 text-[18px] font-semibold">
                        <button
                            type="button"
                            onClick={handleConfirmCancel}
                            className="px-6 py-5 text-center text-red-500 transition hover:bg-red-50"
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCancelModal(false)}
                            className="border-l border-black/10 px-6 py-5 text-center text-[#191414] transition hover:bg-black/5"
                        >
                            Keep Editing
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
