// react
import { useCallback, useState, useMemo } from 'react'

// icons
import { Check } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { Label } from '@shared/components/ui/label'

// @domains - quick-sell
import type {
    QuickSellInvoiceDraft,
    QuickSellLineItem,
    CustomLineItem,
    ArtworkLineItem,
} from '../../types/quickSellDraft'
import { createCustomLineItem, createArtworkLineItem } from '../../types/quickSellDraft'
import { validateInvoiceDraft } from '../../types/quickSellValidation'
import type { QuickSellArtworkOption } from './QuickSellArtworkPickerModal'
import { QuickSellCustomItemRow } from './QuickSellCustomItemRow'
import { QuickSellArtworkItemRow } from './QuickSellArtworkItemRow'
import { QuickSellArtworkPickerModal } from './QuickSellArtworkPickerModal'

type QuickSellInvoiceFormProps = {
    draft: QuickSellInvoiceDraft
    onChange: (draft: QuickSellInvoiceDraft) => void
}

export const QuickSellInvoiceForm = ({
    draft,
    onChange,
}: QuickSellInvoiceFormProps) => {
    // -- state --
    const [isArtworkPickerOpen, setIsArtworkPickerOpen] = useState(false)

    // -- derived --
    const validation = useMemo(() => validateInvoiceDraft(draft), [draft])
    const errorMap = useMemo(() => {
        const map: { [key: string]: string } = {}
        validation.errors.forEach((error) => {
            map[error.field] = error.message
        })
        return map
    }, [validation])

    // -- handlers --
    const handleBuyerChange = useCallback(
        (field: keyof QuickSellInvoiceDraft['buyer'], value: string) => {
            onChange({
                ...draft,
                buyer: { ...draft.buyer, [field]: value },
            })
        },
        [draft, onChange],
    )

    const handleAddCustomItem = useCallback(() => {
        const newItem = createCustomLineItem()
        onChange({
            ...draft,
            items: [...draft.items, newItem],
        })
    }, [draft, onChange])

    const handleSelectArtwork = useCallback(
        (artwork: QuickSellArtworkOption) => {
            const newItem = createArtworkLineItem({
                id: artwork.id,
                name: artwork.name,
                imageUrl: artwork.imageUrl,
                artistName: artwork.artistName,
                year: artwork.year,
                dimensions: artwork.dimensions,
                materials: artwork.materials,
                price: artwork.price,
            })
            onChange({
                ...draft,
                items: [...draft.items, newItem],
            })
        },
        [draft, onChange],
    )

    const handleUpdateItem = useCallback(
        (index: number, updates: Partial<QuickSellLineItem>) => {
            const newItems = draft.items.map((item, i) => {
                if (i === index) {
                    return { ...item, ...updates } as QuickSellLineItem
                }
                return item
            })
            onChange({ ...draft, items: newItems })
        },
        [draft, onChange],
    )

    const handleRemoveItem = useCallback(
        (index: number) => {
            const newItems = draft.items.filter((_, i) => i !== index)
            onChange({ ...draft, items: newItems })
        },
        [draft, onChange],
    )

    const handleTaxToggle = useCallback(
        () => {
            // Toggle. If currently "Artist manages" (false), it becomes true.
            // Note: Draft uses `isApplySalesTax`.
            // In layout: Checkbox "I don't want ... to manage tax" -> implies manual is ON when checked?
            // Let's stick to simple toggle for now:
            onChange({ ...draft, isApplySalesTax: !draft.isApplySalesTax })
        },
        [draft, onChange],
    )

    const handleTaxPercentChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value
            if (rawValue === '') {
                onChange({ ...draft, taxPercent: undefined })
                return
            }
            const value = parseFloat(rawValue)
            onChange({ ...draft, taxPercent: isNaN(value) ? 0 : Math.min(100, Math.max(0, value)) })
        },
        [draft, onChange],
    )

    const handleTaxZipChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange({ ...draft, taxZipCode: e.target.value })
        },
        [draft, onChange],
    )

    // -- render --
    const sectionTitleClass = "mb-2 text-[13px] font-extrabold uppercase tracking-widest text-[#191414]"
    const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#191414]"
    const inputClass = "h-[44px] rounded border-[#E5E5E5] bg-white px-4 text-[14px] text-[#191414] placeholder:text-[#989898] focus:border-black focus:ring-0"

    return (
        <div className="flex flex-col gap-10 pb-10">
            {/* Buyer Information Section */}
            <div>
                <h2 className={sectionTitleClass}>BUYER INFORMATION</h2>
                <p className="mb-6 text-[13px] text-[#595959]">
                    Enter the buyer details if available. You can update or complete these details anytime before sending the invoice.
                </p>

                <div className="space-y-5">
                    <div>
                        <Label htmlFor="buyer-name" className={labelClass}>
                            FULL NAME
                        </Label>
                        <Input
                            id="buyer-name"
                            type="text"
                            value={draft.buyer.name}
                            onChange={(e) => handleBuyerChange('name', e.target.value)}
                            placeholder=""
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <Label htmlFor="buyer-email" className={labelClass}>
                            EMAIL ADDRESS
                        </Label>
                        <Input
                            id="buyer-email"
                            type="email"
                            value={draft.buyer.email}
                            onChange={(e) => handleBuyerChange('email', e.target.value)}
                            placeholder=""
                            className={`${inputClass} ${errorMap['buyer.email'] ? 'border-red-500' : ''}`}
                        />
                        {errorMap['buyer.email'] && (
                            <p className="mt-1 text-xs text-red-500">{errorMap['buyer.email']}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="buyer-message" className={labelClass}>
                            MESSAGE TO BUYER
                        </Label>
                        <div className="relative">
                            <Textarea
                                id="buyer-message"
                                value={draft.buyer.message || ''}
                                onChange={(e) => handleBuyerChange('message', e.target.value)}
                                placeholder="Enter your message to the buyer (optional)"
                                className="min-h-[120px] resize-none rounded border-[#E5E5E5] bg-white p-4 text-[14px] text-[#191414] placeholder:text-[#989898] focus:border-black focus:ring-0"
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-[#989898]">
                                {(draft.buyer.message || '').length}/2000 characters
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-[#989898]">
                            This message will be included in the email sent to the buyer with the invoice.
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-[#E5E5E5]" />

            {/* Line Items Section */}
            <div>
                <div className="flex items-center gap-1 mb-2">
                    <h2 className={sectionTitleClass.replace('mb-2', 'mb-0')}>ITEMS</h2>
                    <span className="text-red-500 text-[10px]">*</span>
                </div>
                <p className="mb-6 text-[13px] text-[#595959]">
                    Add items from your inventory or add new custom items for invoicing.
                </p>

                {/* Items Error */}
                {errorMap['items'] && (
                    <div className="mb-4 rounded bg-red-50 p-3">
                        <p className="text-xs text-red-600">{errorMap['items']}</p>
                    </div>
                )}

                {/* Items List */}
                {draft.items.length > 0 && (
                    <div className="mb-6 space-y-4">
                        {draft.items.map((item, index) =>
                            item.type === 'artwork' ? (
                                <QuickSellArtworkItemRow
                                    key={item.id}
                                    item={item as ArtworkLineItem}
                                    index={index}
                                    onUpdate={handleUpdateItem as any}
                                    onRemove={handleRemoveItem}
                                    errors={errorMap}
                                />
                            ) : (
                                <QuickSellCustomItemRow
                                    key={item.id}
                                    item={item as CustomLineItem}
                                    index={index}
                                    onUpdate={handleUpdateItem as any}
                                    onRemove={handleRemoveItem}
                                    errors={errorMap}
                                />
                            ),
                        )}
                    </div>
                )}

                {/* Add Item Buttons */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsArtworkPickerOpen(true)}
                        className="h-[44px] flex-1 rounded-full border border-blue-600 bg-white text-[13px] font-semibold text-blue-600 hover:bg-blue-50"
                    >
                        Add item from inventory
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddCustomItem}
                        disabled
                        className="h-[44px] flex-1 rounded-full border border-blue-600 bg-white text-[13px] font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add a custom item
                    </Button>
                </div>

                <p className="mt-4 text-[11px] text-[#989898]">
                    All payments will be processed securely through Artium's payment platform and will follow our standard <span className="text-blue-600 underline cursor-pointer">terms of service</span>.
                </p>
            </div>

            <hr className="border-[#E5E5E5]" />

            {/* Tax Section */}
            <div>
                <div className="flex items-center gap-1 mb-2">
                    <h2 className={sectionTitleClass.replace('mb-2', 'mb-0')}>SALES TAX</h2>
                    <span className="text-red-500 text-[10px]">*</span>
                </div>
                <p className="mb-6 text-[13px] text-[#595959]">
                    Sales tax is set by the seller, or calculated based on the buyer's city/state for orders with shipping. <span className="text-blue-600 cursor-pointer">Learn more</span>
                </p>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1.5">
                            <Label htmlFor="tax-zip" className="text-[10px] font-bold uppercase tracking-wide text-[#191414]">
                                ZIPCODE
                            </Label>
                            <span className="text-red-500 text-[10px]">*</span>
                        </div>
                        <Input
                            id="tax-zip"
                            type="text"
                            value={draft.taxZipCode || ''}
                            onChange={handleTaxZipChange}
                            placeholder=""
                            className={inputClass}
                        />
                    </div>
                    <div className="w-[140px]">
                        <div className="flex items-center gap-1 mb-1.5">
                            <Label htmlFor="tax-percent" className="text-[10px] font-bold uppercase tracking-wide text-[#191414]">
                                SALES TAX
                            </Label>
                            <span className="text-red-500 text-[10px]">*</span>
                        </div>
                        <div className="relative">
                            <Input
                                id="tax-percent"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={draft.taxPercent ?? ''}
                                onChange={handleTaxPercentChange}
                                className={inputClass}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#989898]">%</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <button
                        type="button"
                        onClick={handleTaxToggle}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${draft.isApplySalesTax ? 'border-black bg-black' : 'border-[#E5E5E5] bg-white'}`}
                    >
                        {draft.isApplySalesTax && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <div
                        className="text-[13px] text-[#191414] cursor-pointer"
                        onClick={handleTaxToggle}
                    >
                        <span className="font-medium">I don't want Artium to manage my sales tax, by clicking this box I acknowledge I will handle sales tax collection by myself</span>
                    </div>
                </div>
            </div>

            {/* Artwork Picker Modal */}
            <QuickSellArtworkPickerModal
                isOpen={isArtworkPickerOpen}
                onClose={() => setIsArtworkPickerOpen(false)}
                onSelect={handleSelectArtwork}
            />
        </div>
    )
}
