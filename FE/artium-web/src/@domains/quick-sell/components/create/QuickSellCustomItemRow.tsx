// react
import { useCallback } from 'react'

// icons
import { Trash2 } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'

// @domains - quick-sell
import type { CustomLineItem } from '../../types/quickSellDraft'
import { formatMoney, calculateItemTotal } from '../../utils/pricing'

type QuickSellCustomItemRowProps = {
    item: CustomLineItem
    index: number
    onUpdate: (index: number, updates: Partial<CustomLineItem>) => void
    onRemove: (index: number) => void
    errors?: { [key: string]: string }
}

export const QuickSellCustomItemRow = ({
    item,
    index,
    onUpdate,
    onRemove,
    errors = {},
}: QuickSellCustomItemRowProps) => {
    // -- handlers --
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onUpdate(index, { title: e.target.value })
        },
        [index, onUpdate],
    )

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

    const handleQuantityChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value) || 1
            onUpdate(index, { quantity: Math.max(1, value) })
        },
        [index, onUpdate],
    )

    const handleRemove = useCallback(() => {
        onRemove(index)
    }, [index, onRemove])

    // -- derived --
    const itemTotal = calculateItemTotal(item)
    const titleError = errors[`items.${index}.title`]
    const priceError = errors[`items.${index}.price`]
    const discountError = errors[`items.${index}.discountPercent`]

    // -- render --
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                    {/* Title */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Item Title
                        </label>
                        <Input
                            type="text"
                            value={item.title}
                            onChange={handleTitleChange}
                            placeholder="Enter item title"
                            className={titleError ? 'border-red-500' : ''}
                        />
                        {titleError && (
                            <p className="mt-1 text-sm text-red-500">{titleError}</p>
                        )}
                    </div>

                    {/* Price, Discount, Quantity row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Price ($)
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={handlePriceChange}
                                className={priceError ? 'border-red-500' : ''}
                            />
                            {priceError && (
                                <p className="mt-1 text-sm text-red-500">{priceError}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Discount (%)
                            </label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discountPercent}
                                onChange={handleDiscountChange}
                                className={discountError ? 'border-red-500' : ''}
                            />
                            {discountError && (
                                <p className="mt-1 text-sm text-red-500">{discountError}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Qty
                            </label>
                            <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={handleQuantityChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Remove button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    className="mt-6 text-slate-400 hover:text-red-500"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Item Total */}
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                <span className="text-sm font-medium text-slate-900">
                    Item Total: {formatMoney(itemTotal)}
                </span>
            </div>
        </div>
    )
}
