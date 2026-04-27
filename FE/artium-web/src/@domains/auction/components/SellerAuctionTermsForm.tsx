import { useState } from 'react'
import { Button } from '@shared/components/ui/button'
import { Checkbox } from '@shared/components/ui/checkbox'
import { Input } from '@shared/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group'
import { Textarea } from '@shared/components/ui/textarea'
import {
  SELLER_AUCTION_DURATION_PRESETS,
  type SellerAuctionTermsFormValues,
} from '../validations/sellerAuctionTerms.schema'

type SellerAuctionTermsFormProps = {
  values: SellerAuctionTermsFormValues
  errors: Partial<Record<keyof SellerAuctionTermsFormValues, string>>
  hasSubmitted: boolean
  onChange: (nextValues: SellerAuctionTermsFormValues) => void
  onValidate: () => void
  onBack: () => void
  onSaveDraft: () => void
  onStartAttempt: () => void
  isStartDisabled: boolean
}

type SellerAuctionTermsFieldName = keyof SellerAuctionTermsFormValues

const fieldLabelClass = 'text-sm font-bold text-[#191414]'
const helperClass = 'mt-2 text-sm leading-6 text-[#191414]/60'
const errorClass = 'mt-2 text-sm font-medium text-[#FF4337]'
const actionButtonClass = 'w-full md:w-auto'

const getFieldMessageId = (field: SellerAuctionTermsFieldName) => `${field}-message`

export const SellerAuctionTermsForm = ({
  values,
  errors,
  hasSubmitted,
  onChange,
  onValidate,
  onBack,
  onSaveDraft,
  onStartAttempt,
  isStartDisabled,
}: SellerAuctionTermsFormProps) => {
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<SellerAuctionTermsFieldName, boolean>>
  >({})

  const hasErrors = Object.keys(errors).length > 0

  const markFieldTouched = (field: SellerAuctionTermsFieldName) => {
    setTouchedFields((previous) =>
      previous[field] ? previous : { ...previous, [field]: true },
    )
  }

  const shouldShowError = (field: SellerAuctionTermsFieldName) =>
    Boolean(errors[field]) && (hasSubmitted || touchedFields[field])

  const handleBlur = (field: SellerAuctionTermsFieldName) => {
    markFieldTouched(field)
    onValidate()
  }

  const handleValuesChange = (
    field: SellerAuctionTermsFieldName,
    nextValues: SellerAuctionTermsFormValues,
  ) => {
    markFieldTouched(field)
    onChange(nextValues)
  }

  return (
    <section className="rounded-[32px] border border-black/10 bg-white p-6 md:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
        AUCTION TERMS
      </p>
      <h2 className="mt-3 text-[40px] font-semibold leading-[44px] tracking-[-0.04em] text-[#191414]">
        Set terms before activation
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-6 text-[#191414]/65">
        Configure the contract-backed rules buyers will see before this auction is started on
        Sepolia.
      </p>

      {hasSubmitted && hasErrors ? (
        <div
          className="mt-6 rounded-[24px] border border-[#FF4337]/20 bg-[#FFF5F4] px-4 py-3 text-sm font-medium text-[#FF4337]"
          role="alert"
        >
          Review auction terms before continuing.
        </div>
      ) : null}

      <div className="mt-8 space-y-8">
        <fieldset>
          <legend className={fieldLabelClass}>Reserve policy</legend>
          <RadioGroup
            value={values.reservePolicy}
            onValueChange={(nextValue) => {
              if (nextValue !== 'none' && nextValue !== 'set') {
                return
              }

              handleValuesChange('reservePolicy', { ...values, reservePolicy: nextValue })
            }}
            className="mt-4 gap-3"
          >
            {[
              { value: 'none', label: 'No reserve' },
              { value: 'set', label: 'Set reserve price' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-[24px] border px-4 py-4 transition ${
                  values.reservePolicy === option.value
                    ? 'border-[#2351FC] bg-[#2351FC]/5'
                    : 'border-[#E5E5E5] bg-white'
                }`}
              >
                <RadioGroupItem value={option.value} id={`reserve-policy-${option.value}`} />
                <span className="text-sm font-medium text-[#191414]">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        {values.reservePolicy === 'set' ? (
          <div>
            <label htmlFor="seller-auction-reserve-price" className={fieldLabelClass}>
              Reserve price
            </label>
            <div className="relative mt-3">
              <Input
                id="seller-auction-reserve-price"
                type="text"
                inputMode="decimal"
                value={values.reservePriceEth}
                onChange={(event) =>
                  handleValuesChange('reservePriceEth', {
                    ...values,
                    reservePriceEth: event.target.value,
                  })
                }
                onBlur={() => handleBlur('reservePriceEth')}
                aria-invalid={shouldShowError('reservePriceEth')}
                aria-describedby={
                  shouldShowError('reservePriceEth')
                    ? getFieldMessageId('reservePriceEth')
                    : undefined
                }
                className="h-12 rounded-[20px] border-[#E5E5E5] bg-white pr-14 text-sm text-[#191414] focus-visible:border-[#2351FC] focus-visible:ring-[#2351FC]/20"
                placeholder="0.00"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#191414]/50">
                ETH
              </span>
            </div>
            <p className={helperClass}>The sale completes only if the final bid meets this reserve.</p>
            {shouldShowError('reservePriceEth') ? (
              <p id={getFieldMessageId('reservePriceEth')} className={errorClass}>
                {errors.reservePriceEth}
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label htmlFor="seller-auction-min-bid-increment" className={fieldLabelClass}>
            Minimum bid increment
          </label>
          <div className="relative mt-3">
            <Input
              id="seller-auction-min-bid-increment"
              type="text"
              inputMode="decimal"
              value={values.minBidIncrementEth}
              onChange={(event) =>
                handleValuesChange('minBidIncrementEth', {
                  ...values,
                  minBidIncrementEth: event.target.value,
                })
              }
              onBlur={() => handleBlur('minBidIncrementEth')}
                aria-invalid={shouldShowError('minBidIncrementEth')}
                aria-describedby={`seller-auction-min-bid-increment-helper seller-auction-min-bid-increment-note${
                  shouldShowError('minBidIncrementEth')
                    ? ` ${getFieldMessageId('minBidIncrementEth')}`
                    : ''
                }`}
                className="h-12 rounded-[20px] border-[#E5E5E5] bg-white pr-14 text-sm text-[#191414] focus-visible:border-[#2351FC] focus-visible:ring-[#2351FC]/20"
                placeholder="0.00"
              />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#191414]/50">
              ETH
            </span>
          </div>
          <p id="seller-auction-min-bid-increment-helper" className={helperClass}>
            The first bid must be at least this amount; later bids must increase by at least this
            amount.
          </p>
          <p id="seller-auction-min-bid-increment-note" className="mt-1 text-sm leading-6 text-[#191414]/60">
            On the current contract, this also acts as the first-bid floor.
          </p>
          {shouldShowError('minBidIncrementEth') ? (
            <p id={getFieldMessageId('minBidIncrementEth')} className={errorClass}>
              {errors.minBidIncrementEth}
            </p>
          ) : null}
        </div>

        <div>
          <p className={fieldLabelClass}>Duration</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {SELLER_AUCTION_DURATION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() =>
                  handleValuesChange('durationPreset', { ...values, durationPreset: preset.value })
                }
                className={`rounded-[22px] border px-4 py-3 text-sm font-medium transition ${
                  values.durationPreset === preset.value
                    ? 'border-[#2351FC] bg-[#2351FC] text-white'
                    : 'border-[#E5E5E5] bg-white text-[#191414]'
                }`}
              >
                {preset.label}
              </button>
            ))}
              <button
                type="button"
                onClick={() => handleValuesChange('durationPreset', { ...values, durationPreset: 'custom' })}
                className={`rounded-[22px] border px-4 py-3 text-sm font-medium transition ${
                  values.durationPreset === 'custom'
                    ? 'border-[#2351FC] bg-[#2351FC] text-white'
                  : 'border-[#E5E5E5] bg-white text-[#191414]'
              }`}
            >
              Custom
            </button>
          </div>
          {shouldShowError('durationPreset') ? (
            <p id={getFieldMessageId('durationPreset')} className={errorClass}>
              {errors.durationPreset}
            </p>
          ) : null}

          {values.durationPreset === 'custom' ? (
            <div className="mt-4">
              <label htmlFor="seller-auction-custom-duration-hours" className={fieldLabelClass}>
                Custom duration hours
              </label>
              <Input
                id="seller-auction-custom-duration-hours"
                type="number"
                min="24"
                max="720"
                step="1"
                value={values.customDurationHours}
                onChange={(event) =>
                  handleValuesChange('customDurationHours', {
                    ...values,
                    customDurationHours: event.target.value,
                  })
                }
                onBlur={() => handleBlur('customDurationHours')}
                aria-invalid={shouldShowError('customDurationHours')}
                aria-describedby={
                  shouldShowError('customDurationHours')
                    ? getFieldMessageId('customDurationHours')
                    : undefined
                }
                className="mt-3 h-12 rounded-[20px] border-[#E5E5E5] bg-white text-sm text-[#191414] focus-visible:border-[#2351FC] focus-visible:ring-[#2351FC]/20"
                placeholder="24"
              />
              {shouldShowError('customDurationHours') ? (
                <p id={getFieldMessageId('customDurationHours')} className={errorClass}>
                  {errors.customDurationHours}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="seller-auction-shipping-disclosure" className={fieldLabelClass}>
            Shipping and fulfillment notes
          </label>
          <Textarea
            id="seller-auction-shipping-disclosure"
            value={values.shippingDisclosure}
            onChange={(event) =>
              handleValuesChange('shippingDisclosure', {
                ...values,
                shippingDisclosure: event.target.value,
              })
            }
            onBlur={() => handleBlur('shippingDisclosure')}
            aria-invalid={shouldShowError('shippingDisclosure')}
            aria-describedby={
              shouldShowError('shippingDisclosure')
                ? getFieldMessageId('shippingDisclosure')
                : undefined
            }
            className="mt-3 min-h-[120px] rounded-[20px] border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#191414] focus-visible:border-[#2351FC] focus-visible:ring-[#2351FC]/20"
            placeholder="Describe delivery expectations, insurance, framing, or pickup details."
          />
          {shouldShowError('shippingDisclosure') ? (
            <p id={getFieldMessageId('shippingDisclosure')} className={errorClass}>
              {errors.shippingDisclosure}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="seller-auction-payment-disclosure" className={fieldLabelClass}>
            Payment and buyer expectations
          </label>
          <Textarea
            id="seller-auction-payment-disclosure"
            value={values.paymentDisclosure}
            onChange={(event) =>
              handleValuesChange('paymentDisclosure', {
                ...values,
                paymentDisclosure: event.target.value,
              })
            }
            onBlur={() => handleBlur('paymentDisclosure')}
            aria-invalid={shouldShowError('paymentDisclosure')}
            aria-describedby={
              shouldShowError('paymentDisclosure')
                ? getFieldMessageId('paymentDisclosure')
                : undefined
            }
            className="mt-3 min-h-[120px] rounded-[20px] border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#191414] focus-visible:border-[#2351FC] focus-visible:ring-[#2351FC]/20"
            placeholder="Describe payment windows, verification, or buyer communication expectations."
          />
          {shouldShowError('paymentDisclosure') ? (
            <p id={getFieldMessageId('paymentDisclosure')} className={errorClass}>
              {errors.paymentDisclosure}
            </p>
          ) : null}
        </div>

        <div className="rounded-[24px] border border-[#E5E5E5] bg-[#FDFDFD] px-4 py-4">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              id="seller-auction-economics-lock"
              checked={values.economicsLockedAcknowledged}
              onCheckedChange={(checked) =>
                handleValuesChange('economicsLockedAcknowledged', {
                  ...values,
                  economicsLockedAcknowledged: checked === true,
                })
              }
              onBlur={() => handleBlur('economicsLockedAcknowledged')}
              aria-invalid={shouldShowError('economicsLockedAcknowledged')}
            />
            <span className="text-sm font-medium leading-6 text-[#191414]">
              I understand auction economics are locked after activation.
            </span>
          </label>
          {shouldShowError('economicsLockedAcknowledged') ? (
            <p id={getFieldMessageId('economicsLockedAcknowledged')} className={errorClass}>
              {errors.economicsLockedAcknowledged}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E5E5] pt-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className={actionButtonClass}
          >
            Back to artwork
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className={actionButtonClass}
          >
            Save Draft
          </Button>
        </div>
        <div className="w-full md:w-auto">
          <Button
            type="button"
            onClick={onStartAttempt}
            disabled={isStartDisabled}
            className="w-full bg-[#191414] text-white hover:bg-[#2351FC]"
          >
            Start Auction
          </Button>
          <p className="mt-3 text-sm leading-6 text-[#191414]/60">
            Auction start connects to wallet and backend orchestration in the next step.
          </p>
        </div>
      </div>
    </section>
  )
}
