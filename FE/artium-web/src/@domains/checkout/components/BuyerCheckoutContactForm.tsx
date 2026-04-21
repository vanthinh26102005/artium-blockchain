import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { AddressFormFields } from '@shared/components/address'
import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

import type { BuyerCheckoutContactStepValues } from '../validations/buyerCheckout.schema'

export const BuyerCheckoutContactForm = () => {
  const {
    control,
    formState: { errors, submitCount },
    register,
    setValue,
  } = useFormContext<BuyerCheckoutContactStepValues>()

  const contact = useWatch({ control, name: 'contact' })
  const deliveryMethod = useWatch({ control, name: 'deliveryMethod' })

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
          Contact Information
        </h2>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('contact.firstName')}
                placeholder="First name"
                maxLength={50}
                className={cn(
                  'h-[48px] rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                  errors.contact?.firstName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#E5E5E5] focus:border-[#0066FF]',
                )}
              />
              <div className="flex justify-between">
                {errors.contact?.firstName?.message ? (
                  <span className="text-[11px] text-red-500">{errors.contact.firstName.message}</span>
                ) : (
                  <span className="text-[11px] text-[#989898]">{contact?.firstName?.length ?? 0}/50</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('contact.lastName')}
                placeholder="Last name"
                maxLength={50}
                className={cn(
                  'h-[48px] rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                  errors.contact?.lastName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#E5E5E5] focus:border-[#0066FF]',
                )}
              />
              <div className="flex justify-between">
                {errors.contact?.lastName?.message ? (
                  <span className="text-[11px] text-red-500">{errors.contact.lastName.message}</span>
                ) : (
                  <span className="text-[11px] text-[#989898]">{contact?.lastName?.length ?? 0}/50</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              {...register('contact.email')}
              placeholder="your@email.com"
              className={cn(
                'h-[48px] rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                errors.contact?.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#E5E5E5] focus:border-[#0066FF]',
              )}
            />
            {errors.contact?.email?.message && (
              <span className="text-[11px] text-red-500">{errors.contact.email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                {...register('contact.phoneCountryCode')}
                className="h-[48px] w-[100px] rounded-[12px] border border-[#E5E5E5] bg-white px-3 text-[15px] font-medium text-[#191414] focus:border-[#0066FF] focus:ring-0"
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+84">🇻🇳 +84</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+82">🇰🇷 +82</option>
              </select>
              <Input
                type="tel"
                {...register('contact.phone')}
                placeholder="000-000-0000"
                className={cn(
                  'h-[48px] flex-1 rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
                  errors.contact?.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#E5E5E5] focus:border-[#0066FF]',
                )}
              />
            </div>
            {errors.contact?.phone?.message ? (
              <span className="text-[11px] text-red-500">{errors.contact.phone.message}</span>
            ) : (
              <span className="text-[11px] text-[#989898]">
                We will only use your phone number for delivery purposes.
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
          Delivery Method
        </h2>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('deliveryMethod', 'pickup', { shouldDirty: true, shouldValidate: true })}
            className={`flex-1 rounded-full border-2 py-3 text-[14px] font-bold transition ${
              deliveryMethod === 'pickup'
                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]'
            }`}
          >
            Pick up / Ship by seller
          </button>
          <button
            type="button"
            onClick={() =>
              setValue('deliveryMethod', 'ship_by_platform', { shouldDirty: true, shouldValidate: true })
            }
            className={`flex-1 rounded-full border-2 py-3 text-[14px] font-bold transition ${
              deliveryMethod === 'ship_by_platform'
                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]'
            }`}
          >
            Ship by Artium
          </button>
        </div>
      </section>

      {deliveryMethod === 'ship_by_platform' && (
        <section className="rounded-[24px] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
            Shipping Address
          </h2>

          <Controller
            name="shippingAddress"
            control={control}
            render={({ field }) => (
              <AddressFormFields
                value={field.value}
                onChange={field.onChange}
                showValidation={submitCount > 0}
                errors={{
                  addressLine1: errors.shippingAddress?.addressLine1?.message,
                  city: errors.shippingAddress?.city?.message,
                  state: errors.shippingAddress?.state?.message,
                  postalCode: errors.shippingAddress?.postalCode?.message,
                  country: errors.shippingAddress?.country?.message,
                }}
              />
            )}
          />
        </section>
      )}
    </div>
  )
}
