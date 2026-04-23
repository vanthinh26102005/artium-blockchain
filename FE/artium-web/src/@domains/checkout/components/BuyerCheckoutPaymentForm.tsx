import { useFormContext, useWatch } from 'react-hook-form'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { CreditCard } from 'lucide-react'

import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

import type { BuyerCheckoutPaymentValues } from '../validations/buyerCheckout.schema'
import { WalletPaymentSection } from './WalletPaymentSection'

export type CardData = Pick<
  Extract<BuyerCheckoutPaymentValues, { paymentMethod: 'card' }>,
  'cardNumber' | 'expiryDate' | 'cvc'
>

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\s+/g, '').replace(/[^0-9]/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const formatExpiryDate = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

const formatCvc = (value: string) => value.replace(/\D/g, '').slice(0, 4)

const METHOD_OPTIONS = [
  { value: 'card' as const, label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'wallet' as const, label: 'Crypto Wallet', icon: <span className="text-lg">🦊</span> },
]

type CardSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  cardNumber: string
  expiryDate: string
  cvc: string
  selectedCountry: string
}

function CardSection({ register, errors, setValue, cardNumber, expiryDate, cvc, selectedCountry }: CardSectionProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="border-t border-black/5 p-6 pt-4">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Số Thẻ
            </label>
            <div className="relative">
              <Input
                {...register('cardNumber')}
                value={cardNumber}
                onChange={(event) =>
                  setValue('cardNumber', formatCardNumber(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                placeholder="1234 1234 1234 1234"
                maxLength={19}
                className={cn(
                  'h-12 rounded-xl border bg-white pr-28 text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                  errors.cardNumber
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#E5E5E5] focus:border-[#0066FF]',
                )}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
              </div>
            </div>
            {errors.cardNumber?.message && (
              <span className="text-[11px] text-red-500">{String(errors.cardNumber.message)}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                Ngày Hết Hạn
              </label>
              <Input
                {...register('expiryDate')}
                value={expiryDate}
                onChange={(event) =>
                  setValue('expiryDate', formatExpiryDate(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                placeholder="MM / YY"
                maxLength={7}
                className={cn(
                  'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                  errors.expiryDate
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#E5E5E5] focus:border-[#0066FF]',
                )}
              />
              {errors.expiryDate?.message && (
                <span className="text-[11px] text-red-500">{String(errors.expiryDate.message)}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                Mã Bảo Mật
              </label>
              <div className="relative">
                <Input
                  {...register('cvc')}
                  value={cvc}
                  onChange={(event) =>
                    setValue('cvc', formatCvc(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="CVC"
                  maxLength={4}
                  type="password"
                  className={cn(
                    'h-12 rounded-xl border bg-white pr-12 text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                    errors.cvc
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#E5E5E5] focus:border-[#0066FF]',
                  )}
                />
                <CreditCard className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#989898]" />
              </div>
              {errors.cvc?.message && (
                <span className="text-[11px] text-red-500">{String(errors.cvc.message)}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Quốc Gia
            </label>
            <select
              {...register('country')}
              value={selectedCountry}
              onChange={(event) =>
                setValue('country', event.target.value, { shouldDirty: true, shouldValidate: true })
              }
              className={cn(
                'h-12 w-full rounded-xl border bg-white px-4 text-[15px] font-medium text-[#191414] focus:ring-0',
                errors.country
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#E5E5E5] focus:border-[#0066FF]',
              )}
            >
              <option value="VN">Việt Nam</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="JP">Japan</option>
            </select>
            {errors.country?.message && (
              <span className="text-[11px] text-red-500">{String(errors.country.message)}</span>
            )}
          </div>

          <p className="text-[13px] leading-relaxed text-[#595959]">
            Khi cung cấp thông tin thẻ, bạn cho phép Artium tính phí thẻ của bạn cho các khoản
            thanh toán trong tương lai theo các điều khoản của họ.
          </p>
        </div>
      </div>
    </div>
  )
}

type Props = {
  ethAmount?: number
}

export const BuyerCheckoutPaymentForm = ({ ethAmount }: Props) => {
  const {
    formState: { errors },
    register,
    setValue,
  } = useFormContext<BuyerCheckoutPaymentValues>()

  const paymentMethod = useWatch({ name: 'paymentMethod' }) ?? 'card'
  const selectedCountry = useWatch({ name: 'country' }) ?? 'VN'
  const cardNumber = useWatch({ name: 'cardNumber' }) ?? ''
  const expiryDate = useWatch({ name: 'expiryDate' }) ?? ''
  const cvc = useWatch({ name: 'cvc' }) ?? ''

  const handleMethodChange = (method: 'card' | 'wallet') => {
    setValue('paymentMethod', method, { shouldDirty: true, shouldValidate: false })
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
              'flex items-center justify-center gap-3 rounded-[16px] border-2 p-4 transition',
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

      {/* Card fields */}
      {paymentMethod === 'card' && (
        <CardSection
          register={register}
          errors={errors}
          setValue={setValue}
          cardNumber={cardNumber}
          expiryDate={expiryDate}
          cvc={cvc}
          selectedCountry={selectedCountry}
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
          onTxHashReceived={(hash) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue('txHash' as any, hash, { shouldDirty: true, shouldValidate: true })
          }
          errors={errors}
        />
      )}
    </div>
  )
}
