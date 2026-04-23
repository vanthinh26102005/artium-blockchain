import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { UseFormSetValue } from 'react-hook-form'

import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import type { StripeCardNumberElementChangeEvent, StripeElementChangeEvent } from '@stripe/stripe-js'
import { CreditCard } from 'lucide-react'

import { cn } from '@shared/lib/utils'

import type { BuyerCheckoutPaymentValues } from '../validations/buyerCheckout.schema'
import { WalletPaymentSection } from './WalletPaymentSection'

const STRIPE_ELEMENT_STYLE = {
  base: {
    fontSize: '15px',
    color: '#191414',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    '::placeholder': { color: '#989898' },
    fontSmoothing: 'antialiased',
  },
  invalid: { color: '#ef4444', iconColor: '#ef4444' },
}

const METHOD_OPTIONS = [
  { value: 'card' as const, label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'wallet' as const, label: 'Crypto Wallet', icon: <span className="text-lg">🦊</span> },
]

type StripeCardSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  selectedCountry: string
  onCardElementsChange: (complete: boolean) => void
}

function StripeCardSection({ setValue, selectedCountry, onCardElementsChange }: StripeCardSectionProps) {
  const [numberState, setNumberState] = useState<{ complete: boolean; error?: string }>({ complete: false })
  const [expiryState, setExpiryState] = useState<{ complete: boolean; error?: string }>({ complete: false })
  const [cvcState, setCvcState] = useState<{ complete: boolean; error?: string }>({ complete: false })
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const fieldBorderClass = (error?: string, fieldName?: string) =>
    cn(
      'h-12 flex items-center rounded-xl border px-4 bg-white transition-colors',
      error
        ? 'border-red-500'
        : focusedField === fieldName
          ? 'border-[#0066FF]'
          : 'border-[#E5E5E5]',
    )

  const handleNumberChange = (e: StripeCardNumberElementChangeEvent) => {
    setNumberState({ complete: e.complete, error: e.error?.message })
    onCardElementsChange(e.complete && expiryState.complete && cvcState.complete)
  }

  const handleExpiryChange = (e: StripeElementChangeEvent) => {
    setExpiryState({ complete: e.complete, error: e.error?.message })
    onCardElementsChange(numberState.complete && e.complete && cvcState.complete)
  }

  const handleCvcChange = (e: StripeElementChangeEvent) => {
    setCvcState({ complete: e.complete, error: e.error?.message })
    onCardElementsChange(numberState.complete && expiryState.complete && e.complete)
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="border-t border-black/5 p-6 pt-4">
        <div className="space-y-5">
          {/* Card Number */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Card Number
            </label>
            <div className={fieldBorderClass(numberState.error, 'number')}>
              <CardNumberElement
                options={{ style: STRIPE_ELEMENT_STYLE, showIcon: true }}
                onChange={handleNumberChange}
                onFocus={() => setFocusedField('number')}
                onBlur={() => setFocusedField(null)}
                className="w-full"
              />
            </div>
            {numberState.error && (
              <span className="text-[11px] text-red-500">{numberState.error}</span>
            )}
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                Expiry Date
              </label>
              <div className={fieldBorderClass(expiryState.error, 'expiry')}>
                <CardExpiryElement
                  options={{ style: STRIPE_ELEMENT_STYLE }}
                  onChange={handleExpiryChange}
                  onFocus={() => setFocusedField('expiry')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full"
                />
              </div>
              {expiryState.error && (
                <span className="text-[11px] text-red-500">{expiryState.error}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                Security Code
              </label>
              <div className={fieldBorderClass(cvcState.error, 'cvc')}>
                <CardCvcElement
                  options={{ style: STRIPE_ELEMENT_STYLE }}
                  onChange={handleCvcChange}
                  onFocus={() => setFocusedField('cvc')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full"
                />
              </div>
              {cvcState.error && (
                <span className="text-[11px] text-red-500">{cvcState.error}</span>
              )}
            </div>
          </div>

          {/* Billing country */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) =>
                setValue('country', e.target.value, { shouldDirty: true, shouldValidate: true })
              }
              className="h-12 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-[15px] font-medium text-[#191414] focus:border-[#0066FF] focus:outline-none focus:ring-0"
            >
              <option value="VN">Vietnam</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="JP">Japan</option>
            </select>
          </div>

          <p className="text-[13px] leading-relaxed text-[#595959]">
            By providing your card details, you authorise Artium to charge your card for future
            payments in accordance with their terms.
          </p>
        </div>
      </div>
    </div>
  )
}

type Props = {
  ethAmount?: number
  onCardElementsChange?: (complete: boolean) => void
}

export const BuyerCheckoutPaymentForm = ({ ethAmount, onCardElementsChange }: Props) => {
  const { formState: { errors }, setValue } = useFormContext<BuyerCheckoutPaymentValues>()

  const paymentMethod = useWatch({ name: 'paymentMethod' }) ?? 'card'
  const selectedCountry = useWatch({ name: 'country' }) ?? 'VN'

  const handleMethodChange = (method: 'card' | 'wallet') => {
    setValue('paymentMethod', method, { shouldDirty: true, shouldValidate: true })
    onCardElementsChange?.(false)
    if (method === 'card') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue('walletAddress' as any, '', { shouldDirty: true, shouldValidate: false })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue('txHash' as any, '', { shouldDirty: true, shouldValidate: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* Method selector pills */}
      <div className="grid grid-cols-2 gap-3">
        {METHOD_OPTIONS.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleMethodChange(value)}
            className={cn(
              'flex items-center justify-center gap-3 rounded-2xl border-2 p-4 transition',
              paymentMethod === value
                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]',
            )}
          >
            {icon}
            <span className="text-[14px] font-bold">{label}</span>
          </button>
        ))}
      </div>

      {/* Stripe Card Elements */}
      {paymentMethod === 'card' && (
        <StripeCardSection
          setValue={setValue}
          selectedCountry={selectedCountry}
          onCardElementsChange={onCardElementsChange ?? (() => undefined)}
        />
      )}

      {/* Wallet section */}
      {paymentMethod === 'wallet' && (
        <WalletPaymentSection
          ethAmount={ethAmount}
          onWalletConnected={(address) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue('walletAddress' as any, address, { shouldDirty: true, shouldValidate: true })
          }
          onWalletDisconnected={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue('walletAddress' as any, '', { shouldDirty: true, shouldValidate: true })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue('txHash' as any, '', { shouldDirty: true, shouldValidate: true })
          }}
          onTxHashReceived={(hash) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue('txHash' as any, hash, { shouldDirty: true, shouldValidate: true })
          }
          onTxHashCleared={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue('txHash' as any, '', { shouldDirty: true, shouldValidate: true })
          }
          errors={errors}
        />
      )}
    </div>
  )
}
