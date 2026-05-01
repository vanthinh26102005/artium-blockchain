import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Trash2 } from 'lucide-react'

import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'

import type { CustomLineItem } from '../../types/quickSellDraft'
import { calculateItemTotal, formatMoney } from '../../utils/pricing'
import type { QuickSellInvoiceFormValues } from '../../validations/quickSellInvoice.schema'

type QuickSellCustomItemRowProps = {
  index: number
  onRemove: (index: number) => void
}

export const QuickSellCustomItemRow = ({
  index,
  onRemove,
}: QuickSellCustomItemRowProps) => {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<QuickSellInvoiceFormValues>()

  const item = useWatch({
    control,
    name: `items.${index}` as const,
  }) as CustomLineItem

  const itemErrors = errors.items?.[index] as
    | {
        title?: { message?: string }
        price?: { message?: string }
        discountPercent?: { message?: string }
        quantity?: { message?: string }
      }
    | undefined
  const itemTotal = calculateItemTotal(item)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Item Title</label>
            <Input
              type="text"
              {...register(`items.${index}.title` as const)}
              placeholder="Enter item title"
              className={itemErrors?.title ? 'border-red-500' : ''}
            />
            {itemErrors?.title?.message && (
              <p className="mt-1 text-sm text-red-500">{itemErrors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Price ($)</label>
              <Controller
                name={`items.${index}.price` as const}
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.value}
                    onChange={(event) => field.onChange(parseFloat(event.target.value) || 0)}
                    className={itemErrors?.price ? 'border-red-500' : ''}
                  />
                )}
              />
              {itemErrors?.price?.message && (
                <p className="mt-1 text-sm text-red-500">{itemErrors.price.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Discount (%)</label>
              <Controller
                name={`items.${index}.discountPercent` as const}
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(Math.min(100, Math.max(0, parseFloat(event.target.value) || 0)))
                    }
                    className={itemErrors?.discountPercent ? 'border-red-500' : ''}
                  />
                )}
              />
              {itemErrors?.discountPercent?.message && (
                <p className="mt-1 text-sm text-red-500">{itemErrors.discountPercent.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Qty</label>
              <Controller
                name={`items.${index}.quantity` as const}
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="1"
                    value={field.value}
                    onChange={(event) => field.onChange(Math.max(1, parseInt(event.target.value, 10) || 1))}
                    className={itemErrors?.quantity ? 'border-red-500' : ''}
                  />
                )}
              />
              {itemErrors?.quantity?.message && (
                <p className="mt-1 text-sm text-red-500">{itemErrors.quantity.message}</p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="mt-6 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
        <span className="text-sm font-medium text-slate-900">
          Item Total: {formatMoney(itemTotal)}
        </span>
      </div>
    </div>
  )
}
