import { useState, type ReactNode } from 'react'
import { type FieldPath, useFormContext, useWatch } from 'react-hook-form'

import { ChevronDown, ChevronUp, CreditCard, Info } from 'lucide-react'

import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'
import { cn } from '@shared/lib/utils'

import type { QuickSellCheckoutFormValues } from '../../validations/quickSellCheckout.schema'

export const QuickSellCheckoutMainContent = ({
  paymentElement,
  paymentPlaceholder,
  paymentError,
}: {
  paymentElement?: ReactNode
  paymentPlaceholder?: ReactNode
  paymentError?: string | null
}) => {
  const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(true)
  const [isWireTransferOpen, setIsWireTransferOpen] = useState(false)
  const [paymentTab, setPaymentTab] = useState<'card' | 'google' | 'klarna'>('card')
  const {
    formState,
    getFieldState,
    register,
    setValue,
  } = useFormContext<QuickSellCheckoutFormValues>()

  const address = useWatch({ name: 'address' })
  const deliveryMethod = useWatch({ name: 'deliveryMethod' }) ?? 'pickup'
  const paymentCountry = useWatch({ name: 'paymentCountry' }) ?? 'VN'

  const getError = (name: FieldPath<QuickSellCheckoutFormValues>) =>
    getFieldState(name, formState).error?.message

  const cardClass = 'rounded-[24px] border border-black/5 bg-white p-6 md:p-8'
  const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#191414]'
  const inputClass =
    'h-[52px] rounded-xl border border-[#E5E5E5] bg-[#FCFCFC] px-4 text-[15px] font-medium text-[#191414] placeholder:text-[#989898] transition-colors focus:border-[#191414] focus:bg-white focus:ring-0'

  return (
    <div className="flex flex-col gap-4">
      <section className={cardClass}>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          IN-PERSON PAYMENT
        </h3>
        <p className="mb-4 text-[13px] font-medium text-[#595959]">
          Use this option if the buyer is present and ready to pay using Tap to Pay.
        </p>
        <div className="flex items-center gap-3 rounded-[16px] bg-[#F5F5F5] p-4">
          <Info className="h-4 w-4 shrink-0 text-[#989898]" />
          <p className="text-[12px] font-medium text-[#595959]">
            To use Tap to Pay, open this page in the Artium app on a mobile device{' '}
            <span className="cursor-pointer text-blue-600 underline hover:text-blue-700">
              (see list of supported devices)
            </span>
          </p>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="mb-6 text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          CONTACT INFORMATION
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label className={labelClass}>FIRST NAME</Label>
            <Input
              type="text"
              {...register('address.firstName')}
              placeholder=""
              className={cn(inputClass, getError('address.firstName') ? 'border-red-500' : '')}
            />
            <div className="mt-1.5 text-right text-[10px] font-medium text-[#989898]">
              {address?.firstName?.length ?? 0}/50 characters
            </div>
            {getError('address.firstName') && (
              <p className="mt-1 text-xs text-red-500">{getError('address.firstName')}</p>
            )}
          </div>

          <div>
            <Label className={labelClass}>LAST NAME</Label>
            <Input
              type="text"
              {...register('address.lastName')}
              placeholder="Enter last name"
              className={cn(inputClass, getError('address.lastName') ? 'border-red-500' : '')}
            />
            <div className="mt-1.5 text-right text-[10px] font-medium text-[#989898]">
              {address?.lastName?.length ?? 0}/50 characters
            </div>
            {getError('address.lastName') && (
              <p className="mt-1 text-xs text-red-500">{getError('address.lastName')}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Label className={labelClass}>EMAIL ADDRESS</Label>
          <Input
            type="email"
            {...register('address.email')}
            placeholder=""
            className={cn(inputClass, getError('address.email') ? 'border-red-500' : '')}
          />
          {getError('address.email') && (
            <p className="mt-1 text-xs text-red-500">{getError('address.email')}</p>
          )}
        </div>

        <div className="mt-6">
          <Label className={labelClass}>PHONE NUMBER</Label>
          <div className="flex gap-3">
            <div className="flex w-[100px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E5E5E5] bg-[#FCFCFC]">
              <span className="text-[16px]">🇺🇸</span>
              <span className="text-[14px] font-bold text-[#191414]">+1</span>
            </div>
            <Input
              type="tel"
              {...register('address.phone')}
              placeholder="201-555-0123"
              className={`flex-1 ${inputClass}`}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#989898]">
            We will only use your phone number for delivery purposes.
          </p>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          DELIVERY METHOD
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {([
            ['pickup', 'Pick up / Ship by seller'],
            ['Artium', 'Ship by Artium'],
            ['invoice_only', 'Invoice Only'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('deliveryMethod', value, { shouldDirty: true, shouldValidate: true })}
              className={`group relative h-[52px] rounded-full border transition-all ${
                deliveryMethod === value
                  ? 'z-10 border-blue-600 bg-blue-50/50 text-blue-600'
                  : 'border-[#E5E5E5] bg-white text-[#595959] hover:border-[#989898]'
              }`}
            >
              <div className="flex items-center justify-center gap-2.5">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                    deliveryMethod === value
                      ? 'border-blue-600'
                      : 'border-[#D1D1D1] group-hover:border-[#989898]'
                  }`}
                >
                  {deliveryMethod === value && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <span className="text-[13px] font-bold">{label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-[#F5F5F5] p-4">
          <Info className="h-4 w-4 shrink-0 text-[#989898]" />
          <p className="text-[12px] font-medium text-[#595959]">
            Once your payment is processed, you will receive an email to arrange the pick up, drop
            off, or coordinate your own shipping method for your artwork.
          </p>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="mb-6 text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          PICK UP / SHIP ADDRESS
        </h3>

        <div className="space-y-6">
          <div>
            <Label className={labelClass}>ADDRESS LINE 1</Label>
            <Input
              type="text"
              {...register('address.addressLine1')}
              placeholder="Start typing your address..."
              className={cn(inputClass, getError('address.addressLine1') ? 'border-red-500' : '')}
            />
            {getError('address.addressLine1') && (
              <p className="mt-1 text-xs text-red-500">{getError('address.addressLine1')}</p>
            )}
          </div>

          <div>
            <Label className={labelClass}>
              ADDRESS LINE 2{' '}
              <span className="normal-case tracking-normal text-[#989898]">(optional)</span>
            </Label>
            <Input
              type="text"
              {...register('address.addressLine2')}
              placeholder="Apartment, suite, building number"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className={labelClass}>CITY</Label>
              <Input
                type="text"
                {...register('address.city')}
                placeholder="Enter City"
                className={cn(inputClass, getError('address.city') ? 'border-red-500' : '')}
              />
              {getError('address.city') && (
                <p className="mt-1 text-xs text-red-500">{getError('address.city')}</p>
              )}
            </div>

            <div>
              <Label className={labelClass}>STATE / DISTRICT / PROVINCE</Label>
              <Input
                type="text"
                {...register('address.state')}
                placeholder="Enter State/Province/Region"
                className={cn(inputClass, getError('address.state') ? 'border-red-500' : '')}
              />
              {getError('address.state') && (
                <p className="mt-1 text-xs text-red-500">{getError('address.state')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className={labelClass}>COUNTRY</Label>
              <div className="relative">
                <select
                  {...register('address.country')}
                  className={cn(
                    'w-full appearance-none pr-10',
                    inputClass,
                    getError('address.country') ? 'border-red-500' : '',
                  )}
                >
                  <option value="">Enter Country</option>
                  <option value="US">United States</option>
                  <option value="VN">Việt Nam</option>
                  <option value="CA">Canada</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#989898]" />
              </div>
              {getError('address.country') && (
                <p className="mt-1 text-xs text-red-500">{getError('address.country')}</p>
              )}
            </div>

            <div>
              <Label className={labelClass}>POSTAL/ZIP CODE</Label>
              <Input
                type="text"
                {...register('address.postalCode')}
                placeholder="Enter Postal Code/ZIP"
                className={cn(inputClass, getError('address.postalCode') ? 'border-red-500' : '')}
              />
              {getError('address.postalCode') && (
                <p className="mt-1 text-xs text-red-500">{getError('address.postalCode')}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="mb-3 flex items-center gap-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">SALES TAX</h3>
          <span className="text-[11px] text-red-500">*</span>
        </div>
        <p className="mb-6 text-[13px] font-medium text-[#595959]">
          Sales tax is based on the pickup or event ZIP code. You can also manage tax manually.
          Currently applies to U.S. transactions only.{' '}
          <span className="cursor-pointer text-blue-600 underline hover:text-blue-700">
            Learn more
          </span>
          .
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-[#191414]">
                ZIPCODE
              </Label>
              <span className="text-[11px] text-red-500">*</span>
            </div>
            <Input
              type="text"
              {...register('address.postalCode')}
              className={cn(inputClass, getError('address.postalCode') ? 'border-red-500' : '')}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-[#191414]">
                SALES TAX
              </Label>
              <span className="text-[11px] text-red-500">*</span>
            </div>
            <div className="relative">
              <Input type="text" value="6" readOnly className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#989898]">
                %
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-black/5 bg-white">
        <h3 className="p-6 pb-4 text-[11px] font-bold uppercase tracking-wider text-[#989898] md:p-8 md:pb-4">
          PAYMENT METHOD
        </h3>

        <div className="border-t border-[#E5E5E5] bg-white">
          <button
            type="button"
            onClick={() => setIsCardPaymentOpen(!isCardPaymentOpen)}
            className="flex w-full items-center justify-between px-6 py-5 transition hover:bg-[#FAFAFA] md:px-8"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#191414]" />
              <span className="text-[14px] font-bold text-[#191414]">CARD &amp; ONLINE PAYMENT</span>
            </div>
            {isCardPaymentOpen ? (
              <ChevronUp className="h-5 w-5 text-[#989898]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#989898]" />
            )}
          </button>

          {isCardPaymentOpen && (
            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="mb-6 grid grid-cols-3 gap-3">
                {([
                  ['card', 'Thẻ'],
                  ['google', 'Google Pay'],
                  ['klarna', 'Klarna'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentTab(value)}
                    className={`flex h-[64px] flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${
                      paymentTab === value
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-[#E5E5E5] bg-white hover:border-[#989898]'
                    }`}
                  >
                    {value === 'card' ? (
                      <CreditCard
                        className={`h-5 w-5 ${paymentTab === value ? 'text-blue-600' : 'text-[#191414]'}`}
                      />
                    ) : value === 'google' ? (
                      <img
                        src="/images/pay/Google_Pay_Logo.png"
                        alt="Google Pay"
                        className="h-4 object-contain"
                      />
                    ) : (
                      <span className="text-[16px] font-bold leading-none text-pink-500">K.</span>
                    )}
                    <span
                      className={`text-[12px] font-medium ${
                        paymentTab === value ? 'text-blue-600' : 'text-[#595959]'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {paymentTab === 'card' && (
                <div className="space-y-4">
                  {paymentElement ? (
                    <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
                      {paymentElement}
                    </div>
                  ) : (
                    paymentPlaceholder ?? (
                      <div className="grid grid-cols-[1fr_120px] gap-4 md:grid-cols-[1fr_160px_100px]">
                        <div className="col-span-2 md:col-span-1">
                          <Label className={labelClass}>SỐ THẺ</Label>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="1234 1234 1234 1234"
                              className={inputClass}
                              disabled
                            />
                            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 opacity-50">
                              <div className="h-5 w-8 rounded bg-gray-200"></div>
                              <div className="h-5 w-8 rounded bg-gray-200"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className={labelClass}>NGÀY HẾT HẠN</Label>
                          <Input type="text" placeholder="MM / YY" className={inputClass} disabled />
                        </div>
                        <div>
                          <Label className={labelClass}>MÃ BẢO MẬT</Label>
                          <Input type="text" placeholder="CVC" className={inputClass} disabled />
                        </div>
                      </div>
                    )
                  )}

                  <div>
                    <Label className={labelClass}>QUỐC GIA</Label>
                    <div className="relative">
                      <select
                        value={paymentCountry}
                        onChange={(event) =>
                          setValue('paymentCountry', event.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          'w-full appearance-none pr-10',
                          inputClass,
                          getError('paymentCountry') ? 'border-red-500' : '',
                        )}
                      >
                        <option value="VN">Việt Nam</option>
                        <option value="US">United States</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#989898]" />
                    </div>
                    {getError('paymentCountry') && (
                      <p className="mt-1 text-xs text-red-500">{getError('paymentCountry')}</p>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed text-[#595959]">
                    Khi cung cấp thông tin thẻ, bạn cho phép Artium tính phí thẻ của bạn cho các
                    khoản thanh toán trong tương lai theo các điều khoản của họ.
                  </p>

                  {paymentError && (
                    <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-[12px] text-red-600">
                      {paymentError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#E5E5E5] bg-white">
          <button
            type="button"
            onClick={() => setIsWireTransferOpen(!isWireTransferOpen)}
            className="flex w-full items-center justify-between px-6 py-5 transition hover:bg-[#FAFAFA] md:px-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center">
                <svg className="h-full w-full text-[#191414]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <span className="text-[14px] font-bold text-[#191414]">WIRE TRANSFER</span>
            </div>
            {isWireTransferOpen ? (
              <ChevronUp className="h-5 w-5 text-[#989898]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#989898]" />
            )}
          </button>

          {isWireTransferOpen && (
            <div className="px-6 pb-6 md:px-8 md:pb-8">
              <p className="mb-6 text-[13px] leading-relaxed text-[#595959]">
                Transfer funds directly to our account using the details below. Once you&apos;ve made
                payment, contact{' '}
                <a href="mailto:sales@Artium.com" className="text-blue-600 underline hover:text-blue-700">
                  sales@Artium.com
                </a>{' '}
                with your proof of payment. Processing times may take up to five business days.
              </p>

              <div className="rounded-xl bg-[#F9FAFB] p-6">
                <div className="space-y-4">
                  <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                      Bank Name
                    </span>
                    <span className="text-[13px] font-bold text-[#191414]">Silicon Valley Bank (SVB)</span>
                  </div>
                  <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                      Routing Number
                    </span>
                    <span className="text-[13px] font-bold text-[#191414]">121140399</span>
                  </div>
                  <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                      Account Number
                    </span>
                    <span className="text-[13px] font-bold text-[#191414]">3304399019</span>
                  </div>
                  <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                      Swift Code
                    </span>
                    <span className="text-[13px] font-bold text-[#191414]">SVBKUS6S</span>
                  </div>
                  <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                      Account Name
                    </span>
                    <span className="text-[13px] font-bold text-[#191414]">Artium Inc</span>
                  </div>
                  <div className="flex flex-col justify-between gap-1 pt-2 md:flex-row md:items-start">
                    <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                      General Bank Reference Address
                    </span>
                    <span className="max-w-[420px] text-[13px] font-bold text-[#191414] md:text-right">
                      SVB, A Division of First Citizens Bank 3003 Tasman Drive, Santa Clara, CA
                      95054, USA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
