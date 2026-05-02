import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Trash2 } from 'lucide-react'

import { Button } from '@shared/components/ui/button'
import { BaseFormField, BaseInputField } from '@shared/components/forms'

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
  const labelClassName = 'text-sm font-medium text-slate-700'
  const messageClassName = 'text-sm text-red-500'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <BaseInputField
            id={`quick-sell-custom-item-${index}-title`}
            type="text"
            label="Item Title"
            {...register(`items.${index}.title` as const)}
            placeholder="Enter item title"
            errorMessage={itemErrors?.title?.message}
            containerClassName="space-y-1"
            labelClassName={labelClassName}
            messageClassName={messageClassName}
            errorInputClassName="border-red-500"
          />

          <div className="grid grid-cols-3 gap-3">
            <BaseFormField
              id={`quick-sell-custom-item-${index}-price`}
              label="Price ($)"
              errorMessage={itemErrors?.price?.message}
              messageId={`quick-sell-custom-item-${index}-price-message`}
              className="space-y-1"
              labelClassName={labelClassName}
              messageClassName={messageClassName}
            >
              <Controller
                name={`items.${index}.price` as const}
                control={control}
                render={({ field }) => (
                  <input
                    id={`quick-sell-custom-item-${index}-price`}
                    type="number"
                    min="0"
                    step="0.01"
                    aria-invalid={Boolean(itemErrors?.price)}
                    aria-describedby={`quick-sell-custom-item-${index}-price-message`}
                    value={field.value}
                    onChange={(event) => field.onChange(parseFloat(event.target.value) || 0)}
                    className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] ${
                      itemErrors?.price ? 'border-red-500' : 'border-input'
                    }`}
                  />
                )}
              />
            </BaseFormField>

            <BaseFormField
              id={`quick-sell-custom-item-${index}-discount`}
              label="Discount (%)"
              errorMessage={itemErrors?.discountPercent?.message}
              messageId={`quick-sell-custom-item-${index}-discount-message`}
              className="space-y-1"
              labelClassName={labelClassName}
              messageClassName={messageClassName}
            >
              <Controller
                name={`items.${index}.discountPercent` as const}
                control={control}
                render={({ field }) => (
                  <input
                    id={`quick-sell-custom-item-${index}-discount`}
                    type="number"
                    min="0"
                    max="100"
                    aria-invalid={Boolean(itemErrors?.discountPercent)}
                    aria-describedby={`quick-sell-custom-item-${index}-discount-message`}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(Math.min(100, Math.max(0, parseFloat(event.target.value) || 0)))
                    }
                    className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] ${
                      itemErrors?.discountPercent ? 'border-red-500' : 'border-input'
                    }`}
                  />
                )}
              />
            </BaseFormField>

            <BaseFormField
              id={`quick-sell-custom-item-${index}-quantity`}
              label="Qty"
              errorMessage={itemErrors?.quantity?.message}
              messageId={`quick-sell-custom-item-${index}-quantity-message`}
              className="space-y-1"
              labelClassName={labelClassName}
              messageClassName={messageClassName}
            >
              <Controller
                name={`items.${index}.quantity` as const}
                control={control}
                render={({ field }) => (
                  <input
                    id={`quick-sell-custom-item-${index}-quantity`}
                    type="number"
                    min="1"
                    aria-invalid={Boolean(itemErrors?.quantity)}
                    aria-describedby={`quick-sell-custom-item-${index}-quantity-message`}
                    value={field.value}
                    onChange={(event) => field.onChange(Math.max(1, parseInt(event.target.value, 10) || 1))}
                    className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] ${
                      itemErrors?.quantity ? 'border-red-500' : 'border-input'
                    }`}
                  />
                )}
              />
            </BaseFormField>
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
