// react
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// next
import { useRouter } from 'next/router'

// @domains - quick-sell
import { QuickSellCreateInvoiceLayout } from '../components/QuickSellCreateInvoiceLayout'
import { QuickSellInvoiceForm } from '../components/create/QuickSellInvoiceForm'
import { QuickSellInvoicePreview } from '../components/create/QuickSellInvoicePreview'
import { useCreateQuickSellInvoice } from '../hooks/useCreateQuickSellInvoice'
import invoiceApis from '@shared/apis/invoiceApis'
import { defaultInvoiceDraft } from '../types/quickSellDraft'
import { calculateInvoiceTotals } from '../utils/pricing'
import { getInvoiceFromStorage, saveInvoiceToStorage } from '../utils/checkoutStorage'
import type { CheckoutInvoice } from '../types/checkoutTypes'
import { mapInvoiceResponseToCheckoutInvoice } from '../utils/mapInvoiceResponse'
import { mapUpdateInvoicePayload } from '../utils/mapUpdateInvoicePayload'
import {
    quickSellInvoiceFormSchema,
    type QuickSellInvoiceFormValues,
} from '../validations/quickSellInvoice.schema'

// @shared - components
import { Dialog, DialogContent } from '@shared/components/ui/dialog'

type QuickSellCreateInvoicePageViewProps = {
    artworkId?: string
    invoiceCode?: string
}

export const QuickSellCreateInvoicePageView = ({
    invoiceCode,
}: QuickSellCreateInvoicePageViewProps) => {
    // -- router --
    const router = useRouter()

    // -- hooks --
    const { createInvoice, isLoading: isCreating, error, reset } = useCreateQuickSellInvoice()

    // -- state --
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [existingInvoice, setExistingInvoice] = useState<CheckoutInvoice | null>(null)
    const [isModelsLoading, setIsModelsLoading] = useState(!!invoiceCode)
    const form = useForm<QuickSellInvoiceFormValues>({
        resolver: zodResolver(quickSellInvoiceFormSchema),
        defaultValues: defaultInvoiceDraft,
        mode: 'onChange',
    })
    const watchedDraft = useWatch({ control: form.control })
    const draft: QuickSellInvoiceFormValues = useMemo(() => ({
        ...defaultInvoiceDraft,
        ...watchedDraft,
        buyer: {
            ...defaultInvoiceDraft.buyer,
            ...watchedDraft?.buyer,
        },
        items: (watchedDraft?.items as QuickSellInvoiceFormValues['items']) ?? defaultInvoiceDraft.items,
    }), [watchedDraft])

    // -- derived --
    const isEditMode = !!invoiceCode
    const totals = useMemo(() => calculateInvoiceTotals(draft), [draft])
    const isLoading = isCreating || isModelsLoading

    // -- effect: load invoice data for edit --
    useEffect(() => {
        let isMounted = true

        const mapCheckoutInvoiceToDraft = (invoice: CheckoutInvoice): QuickSellInvoiceFormValues => ({
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
                form.reset(mapCheckoutInvoiceToDraft(checkoutInvoice))
                saveInvoiceToStorage(checkoutInvoice)
            } catch {
                const invoice = getInvoiceFromStorage(invoiceCode)
                if (invoice && isMounted) {
                    setExistingInvoice(invoice)
                    form.reset(mapCheckoutInvoiceToDraft(invoice))
                }
            } finally {
                if (isMounted) setIsModelsLoading(false)
            }
        }

        loadInvoice()

        return () => {
            isMounted = false
        }
    }, [form, invoiceCode])

    useEffect(() => {
        if (!error) return

        const subscription = form.watch(() => {
            reset()
        })

        return () => subscription.unsubscribe()
    }, [error, form, reset])

    const handleCancel = useCallback(() => {
        setShowCancelModal(true)
    }, [])

    const handleConfirmCancel = useCallback(() => {
        // Redirect back to list
        router.push('/artist/invoices')
    }, [router])

    const handleSave = form.handleSubmit(async (values) => {
        if (isLoading) return
        try {
            if (isEditMode && existingInvoice) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existingInvoice.id)
                if (isUuid) {
                    const payload = mapUpdateInvoicePayload(values)
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
                        items: values.items.map((item, i) => ({
                            id: item.id || `item-${Date.now()}-${i}`,
                            type: item.type,
                            name: item.type === 'artwork' ? item.artworkName : item.title,
                            price: item.price,
                            quantity: item.quantity,
                            discountPercent: item.discountPercent,
                            imageUrl: item.type === 'artwork' ? item.artworkImageUrl : undefined,
                        })),
                        buyer: values.buyer.name ? {
                            name: values.buyer.name,
                            email: values.buyer.email,
                            message: values.buyer.message,
                        } : undefined,
                        subtotal: totals.subtotal,
                        discountTotal: totals.discountTotal,
                        taxPercent: values.isApplySalesTax ? (values.taxPercent ?? 0) : 0,
                        tax: totals.tax,
                        total: totals.total,
                    }

                    saveInvoiceToStorage(updatedInvoice)
                }
                router.push('/artist/invoices')
            } else {
                await createInvoice(values)
                router.push('/artist/invoices')
            }
        } catch (err) {
            console.error('Failed to save invoice:', err)
        }
    })

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

            <FormProvider {...form}>
                <QuickSellInvoiceForm />
            </FormProvider>
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
                <DialogContent size="4xl" className="overflow-hidden rounded-4xl bg-white p-0">
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
