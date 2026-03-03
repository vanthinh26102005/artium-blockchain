// react
import { useCallback } from 'react'

// icons
import { X } from 'lucide-react'

// @shared - components
import { Input } from '@shared/components/ui/input'

// @domains - quick-sell
import type { ArtworkLineItem } from '../../types/quickSellDraft'

type QuickSellArtworkItemRowProps = {
    item: ArtworkLineItem
    index: number
    onUpdate: (index: number, updates: Partial<ArtworkLineItem>) => void
    onRemove: (index: number) => void
    errors?: { [key: string]: string }
}

export const QuickSellArtworkItemRow = ({
    item,
    index,
    onUpdate,
    onRemove,
    errors = {},
}: QuickSellArtworkItemRowProps) => {
    // -- handlers --
    const handlePriceChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value) || 0
            onUpdate(index, { price: value })
        },
        [index, onUpdate],
    )

    const handleDiscountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value) || 0
            onUpdate(index, { discountPercent: Math.min(100, Math.max(0, value)) })
        },
        [index, onUpdate],
    )

    const handleRemove = useCallback(() => {
        onRemove(index)
    }, [index, onRemove])

    // -- derived --
    const priceError = errors[`items.${index}.price`]

    // -- render --
    return (
        <div className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
                <h3 className="text-[14px] font-bold text-[#191414] uppercase tracking-wide">
                    ITEM #{index + 1}
                </h3>
                <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1 text-[#989898] hover:text-[#191414] transition"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Artwork Info Row */}
                <div className="flex gap-6">
                    {/* Artwork Image */}
                    <div className="w-[200px] h-[200px] shrink-0 overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F5F5F5]">
                        {item.artworkImageUrl ? (
                            <img
                                src={item.artworkImageUrl}
                                alt={item.artworkName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-[#989898]">
                                No image
                            </div>
                        )}
                    </div>

                    {/* Artwork Details */}
                    <div className="flex flex-col justify-center">
                        <h4 className="text-[18px] font-bold text-[#191414]">
                            {item.artworkName}
                        </h4>
                        {item.artistName && (
                            <p className="mt-1 text-[14px] text-[#595959]">
                                {item.artistName}
                            </p>
                        )}
                        <div className="mt-3 space-y-1 text-[14px] text-[#595959]">
                            {item.year && <p>{item.year}</p>}
                            {item.dimensions && <p>{item.dimensions}</p>}
                            {item.materials && <p>{item.materials}</p>}
                        </div>
                    </div>
                </div>

                {/* Price & Discount Row */}
                <div className="mt-8 grid grid-cols-2 gap-6">
                    {/* Sale Price */}
                    <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#191414]">
                            SALE PRICE <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#191414]">
                                $
                            </span>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={handlePriceChange}
                                className={`h-[48px] pl-8 pr-4 text-[14px] rounded-lg border-[#E5E5E5] bg-[#F5F5F5] focus:border-[#191414] focus:ring-0 ${priceError ? 'border-red-500' : ''}`}
                                placeholder="0"
                            />
                        </div>
                        {priceError && (
                            <p className="mt-1 text-xs text-red-500">{priceError}</p>
                        )}
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#191414]">
                            DISCOUNT
                        </label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={handleDiscountChange}
                            className="h-[48px] px-4 text-[14px] rounded-lg border-[#E5E5E5] bg-[#F5F5F5] focus:border-[#191414] focus:ring-0"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

