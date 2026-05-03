import { useCallback, useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { Check } from 'lucide-react'

import { BaseFormField, BaseInputField, BaseTextareaField } from '@shared/components/forms'
import { Button } from '@shared/components/ui/button'

import type { QuickSellArtworkOption } from './QuickSellArtworkPickerModal'
import { QuickSellArtworkItemRow } from './QuickSellArtworkItemRow'
import { QuickSellArtworkPickerModal } from './QuickSellArtworkPickerModal'
import { QuickSellCustomItemRow } from './QuickSellCustomItemRow'
import { createArtworkLineItem, createCustomLineItem } from '../../types/quickSellDraft'
import type { QuickSellInvoiceFormValues } from '../../validations/quickSellInvoice.schema'

/**
 * QuickSellInvoiceForm - React component
 * @returns React element
 */
export const QuickSellInvoiceForm = () => {
  const [isArtworkPickerOpen, setIsArtworkPickerOpen] = useState(false)
  const {
    control,
    formState: { errors },
    register,
    setValue,
  } = useFormContext<QuickSellInvoiceFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const buyerMessage = useWatch({ control, name: 'buyer.message' }) ?? ''
  const isApplySalesTax = useWatch({ control, name: 'isApplySalesTax' }) ?? false

  /**
   * buyerMessage - Utility function
   * @returns void
   */
  const handleAddCustomItem = useCallback(() => {
    append(createCustomLineItem())
  }, [append])

  /**
   * isApplySalesTax - Utility function
   * @returns void
   */
  const handleSelectArtwork = useCallback(
    (artwork: QuickSellArtworkOption) => {
      append(
        createArtworkLineItem({
          id: artwork.id,
          /**
           * handleAddCustomItem - Utility function
           * @returns void
           */
          name: artwork.name,
          imageUrl: artwork.imageUrl,
          artistName: artwork.artistName,
          year: artwork.year,
          dimensions: artwork.dimensions,
          materials: artwork.materials,
          price: artwork.price,
          /**
           * handleSelectArtwork - Utility function
           * @returns void
           */
        }),
      )
    },
    [append],
  )

  const sectionTitleClass =
    'mb-2 text-[13px] font-extrabold uppercase tracking-widest text-[#191414]'
  const labelClass = 'mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#191414]'
  const inputClass =
    'h-[44px] rounded border-[#E5E5E5] bg-white px-4 text-[14px] text-[#191414] placeholder:text-[#989898] focus:border-black focus:ring-0'
  const messageClass = 'mt-1 text-xs text-red-500'
  const helperClass = 'mt-2 text-[11px] text-[#989898]'

  return (
    <div className="flex flex-col gap-10 pb-10">
      <div>
        <h2 className={sectionTitleClass}>BUYER INFORMATION</h2>
        <p className="mb-6 text-[13px] text-[#595959]">
          Enter the buyer details if available. You can update or complete these details anytime /**
          * sectionTitleClass - Utility function * @returns void */ before sending the invoice.
        </p>

        <div className="space-y-5">
          <BaseInputField
            /**
             * labelClass - Utility function
             * @returns void
             */
            id="buyer-name"
            type="text"
            label="FULL NAME"
            {...register('buyer.name')}
            containerClassName="space-y-1.5"
            /**
             * inputClass - Utility function
             * @returns void
             */
            labelClassName={labelClass}
            inputClassName={inputClass}
          />

          <BaseInputField
            /**
             * messageClass - Utility function
             * @returns void
             */
            id="buyer-email"
            type="email"
            label="EMAIL ADDRESS"
            {...register('buyer.email')}
            /**
             * helperClass - Utility function
             * @returns void
             */
            errorMessage={errors.buyer?.email?.message}
            containerClassName="space-y-1.5"
            labelClassName={labelClass}
            messageClassName={messageClass}
            inputClassName={inputClass}
            errorInputClassName="border-red-500"
          />

          <BaseTextareaField
            id="buyer-message"
            label="MESSAGE TO BUYER"
            {...register('buyer.message')}
            placeholder="Enter your message to the buyer (optional)"
            errorMessage={errors.buyer?.message?.message}
            description="This message will be included in the email sent to the buyer with the invoice."
            containerClassName="space-y-1.5"
            labelClassName={labelClass}
            messageClassName={messageClass}
            descriptionClassName={helperClass}
            textareaClassName="min-h-[120px] resize-none rounded border-[#E5E5E5] bg-white p-4 pr-24 text-[14px] text-[#191414] placeholder:text-[#989898] focus:border-black focus:ring-0"
            errorTextareaClassName="border-red-500"
          />
          <div className="-mt-3 flex justify-end text-[10px] text-[#989898]">
            {buyerMessage.length}/2000 characters
          </div>
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      <div>
        <div className="mb-2 flex items-center gap-1">
          <h2 className={sectionTitleClass.replace('mb-2', 'mb-0')}>ITEMS</h2>
          <span className="text-[10px] text-red-500">*</span>
        </div>
        <p className="mb-6 text-[13px] text-[#595959]">
          Add items from your inventory or add new custom items for invoicing.
        </p>

        {errors.items?.message && (
          <div className="mb-4 rounded bg-red-50 p-3">
            <p className="text-xs text-red-600">{errors.items.message}</p>
          </div>
        )}

        {fields.length > 0 && (
          <div className="mb-6 space-y-4">
            {fields.map((field, index) =>
              field.type === 'artwork' ? (
                <QuickSellArtworkItemRow key={field.id} index={index} onRemove={remove} />
              ) : (
                <QuickSellCustomItemRow key={field.id} index={index} onRemove={remove} />
              ),
            )}
          </div>
        )}

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
            className="h-[44px] flex-1 rounded-full border border-blue-600 bg-white text-[13px] font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add a custom item
          </Button>
        </div>

        <p className="mt-4 text-[11px] text-[#989898]">
          All payments will be processed securely through Artium&apos;s payment platform and will
          follow our standard{' '}
          <span className="cursor-pointer text-blue-600 underline">terms of service</span>.
        </p>
      </div>

      <hr className="border-[#E5E5E5]" />

      <div>
        <div className="mb-2 flex items-center gap-1">
          <h2 className={sectionTitleClass.replace('mb-2', 'mb-0')}>SALES TAX</h2>
          <span className="text-[10px] text-red-500">*</span>
        </div>
        <p className="mb-6 text-[13px] text-[#595959]">
          Sales tax is set by the seller, or calculated based on the buyer&apos;s city/state for
          orders with shipping. <span className="cursor-pointer text-blue-600">Learn more</span>
        </p>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <BaseInputField
              id="tax-zip"
              type="text"
              label="ZIPCODE"
              required
              {...register('taxZipCode')}
              containerClassName="space-y-1.5"
              labelClassName={labelClass}
              requiredMarkClassName="text-[10px] text-red-500"
              inputClassName={inputClass}
            />
          </div>

          <div className="w-[140px]">
            <BaseFormField
              id="tax-percent"
              label="SALES TAX"
              required
              errorMessage={errors.taxPercent?.message}
              messageId="tax-percent-message"
              className="space-y-1.5"
              labelClassName={labelClass}
              requiredMarkClassName="text-[10px] text-red-500"
              messageClassName={messageClass}
            >
              <Controller
                name="taxPercent"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      id="tax-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      aria-invalid={Boolean(errors.taxPercent)}
                      aria-describedby="tax-percent-message"
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const rawValue = event.target.value
                        field.onChange(
                          rawValue === ''
                            ? undefined
                            : Math.min(100, Math.max(0, parseFloat(rawValue) || 0)),
                        )
                      }}
                      className={`${inputClass} w-full pr-8 ${errors.taxPercent ? 'border-red-500' : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#989898]">
                      %
                    </div>
                  </div>
                )}
              />
            </BaseFormField>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() =>
              setValue('isApplySalesTax', !isApplySalesTax, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
              isApplySalesTax ? 'border-black bg-black' : 'border-[#E5E5E5] bg-white'
            }`}
          >
            {isApplySalesTax && <Check className="h-3 w-3 text-white" />}
          </button>
          /** * rawValue - Utility function * @returns void */
          <div
            className="cursor-pointer text-[13px] text-[#191414]"
            onClick={() =>
              setValue('isApplySalesTax', !isApplySalesTax, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <span className="font-medium">
              I don&apos;t want Artium to manage my sales tax, by clicking this box I acknowledge I
              will handle sales tax collection by myself
            </span>
          </div>
        </div>
      </div>

      <QuickSellArtworkPickerModal
        isOpen={isArtworkPickerOpen}
        onClose={() => setIsArtworkPickerOpen(false)}
        onSelect={handleSelectArtwork}
      />
    </div>
  )
}
