import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { X } from 'lucide-react'

import { BaseFormField } from '@shared/components/forms'

import type { ArtworkLineItem } from '../../types/quickSellDraft'
import type { QuickSellInvoiceFormValues } from '../../validations/quickSellInvoice.schema'

type QuickSellArtworkItemRowProps = {
  index: number
  onRemove: (index: number) => void
}

/**
 * QuickSellArtworkItemRow - React component
 * @returns React element
 */
export const QuickSellArtworkItemRow = ({
  index,
  onRemove,
}: QuickSellArtworkItemRowProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<QuickSellInvoiceFormValues>()

  const item = useWatch({
    control,
    name: `items.${index}` as const,
/**
 * item - Utility function
 * @returns void
 */
  }) as ArtworkLineItem

  const itemErrors = errors.items?.[index] as
    | {
      price?: { message?: string }
      discountPercent?: { message?: string }
    }
    | undefined
/**
 * itemErrors - Utility function
 * @returns void
 */
  const labelClassName = 'text-[11px] font-bold uppercase tracking-wider text-[#191414]'
  const messageClassName = 'text-xs text-red-500'
  const inputClassName =
    'h-12 rounded-lg border-[#E5E5E5] bg-[#F5F5F5] px-4 text-[14px] focus:border-[#191414] focus:ring-0'

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-4">
        <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#191414]">
/**
 * labelClassName - Utility function
 * @returns void
 */
          ITEM #{index + 1}
        </h3>
        <button
          type="button"
/**
 * messageClassName - Utility function
 * @returns void
 */
          onClick={() => onRemove(index)}
          className="p-1 text-[#989898] transition hover:text-[#191414]"
        >
          <X className="h-5 w-5" />
/**
 * inputClassName - Utility function
 * @returns void
 */
        </button>
      </div>

      <div className="p-6">
        <div className="flex gap-6">
          <div className="h-[200px] w-[200px] shrink-0 overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F5F5F5]">
            {item?.artworkImageUrl ? (
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

          <div className="flex flex-col justify-center">
            <h4 className="text-[18px] font-bold text-[#191414]">{item?.artworkName}</h4>
            {item?.artistName && <p className="mt-1 text-[14px] text-[#595959]">{item.artistName}</p>}
            <div className="mt-3 space-y-1 text-[14px] text-[#595959]">
              {item?.year && <p>{item.year}</p>}
              {item?.dimensions && <p>{item.dimensions}</p>}
              {item?.materials && <p>{item.materials}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <BaseFormField
            id={`quick-sell-item-${index}-price`}
            label="SALE PRICE"
            required
            errorMessage={itemErrors?.price?.message}
            messageId={`quick-sell-item-${index}-price-message`}
            className="space-y-2"
            labelClassName={labelClassName}
            requiredMarkClassName="text-red-500"
            messageClassName={messageClassName}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#191414]">$</span>
              <Controller
                name={`items.${index}.price` as const}
                control={control}
                render={({ field }) => (
                  <input
                    id={`quick-sell-item-${index}-price`}
                    type="number"
                    min="0"
                    step="0.01"
                    aria-invalid={Boolean(itemErrors?.price)}
                    aria-describedby={`quick-sell-item-${index}-price-message`}
                    value={field.value}
                    onChange={(event) => field.onChange(parseFloat(event.target.value) || 0)}
                    className={`${inputClassName} w-full pl-8 ${itemErrors?.price ? 'border-red-500' : ''}`}
                    placeholder="0"
                  />
                )}
              />
            </div>
          </BaseFormField>

          <BaseFormField
            id={`quick-sell-item-${index}-discount`}
            label="DISCOUNT"
            errorMessage={itemErrors?.discountPercent?.message}
            messageId={`quick-sell-item-${index}-discount-message`}
            className="space-y-2"
            labelClassName={labelClassName}
            messageClassName={messageClassName}
          >
            <Controller
              name={`items.${index}.discountPercent` as const}
              control={control}
              render={({ field }) => (
                <input
                  id={`quick-sell-item-${index}-discount`}
                  type="number"
                  min="0"
                  max="100"
                  aria-invalid={Boolean(itemErrors?.discountPercent)}
                  aria-describedby={`quick-sell-item-${index}-discount-message`}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Math.min(100, Math.max(0, parseFloat(event.target.value) || 0)))
                  }
                  className={`${inputClassName} w-full ${itemErrors?.discountPercent ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
              )}
            />
          </BaseFormField>
        </div>
      </div>
    </div>
  )
}
