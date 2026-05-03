import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { AddressFormFields } from '@shared/components/address'
import { BaseFormField, BaseInputField } from '@shared/components/forms'
import { cn } from '@shared/lib/utils'

import type { BuyerCheckoutContactStepValues } from '../validations/buyerCheckout.schema'

/**
 * BuyerCheckoutContactForm - React component
 * @returns React element
 */
export const BuyerCheckoutContactForm = () => {
  const {
    control,
    formState: { errors, submitCount },
    register,
    setValue,
  } = useFormContext<BuyerCheckoutContactStepValues>()

  const contact = useWatch({ control, name: 'contact' })
  const deliveryMethod = useWatch({ control, name: 'deliveryMethod' })
  const labelClassName = 'text-[11px] font-bold uppercase tracking-wider text-[#989898]'
/**
 * contact - Utility function
 * @returns void
 */
  const requiredMarkClassName = 'text-red-500'
  const messageClassName = 'text-[11px] text-red-500'
  const helperClassName = 'text-[11px] text-[#989898]'
  const inputClassName =
/**
 * deliveryMethod - Utility function
 * @returns void
 */
    'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0'
  const defaultInputClassName = 'border-[#E5E5E5] focus:border-[#0066FF]'
  const errorInputClassName = 'border-red-500 focus:border-red-500'

/**
 * labelClassName - Utility function
 * @returns void
 */
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
/**
 * requiredMarkClassName - Utility function
 * @returns void
 */
          Contact Information
        </h2>

        <div className="space-y-5">
/**
 * messageClassName - Utility function
 * @returns void
 */
          <div className="grid grid-cols-2 gap-4">
            <BaseInputField
              {...register('contact.firstName')}
              id="checkout-contact-first-name"
/**
 * helperClassName - Utility function
 * @returns void
 */
              label="First Name"
              required
              placeholder="First name"
              maxLength={50}
/**
 * inputClassName - Utility function
 * @returns void
 */
              errorMessage={errors.contact?.firstName?.message}
              description={`${contact?.firstName?.length ?? 0}/50`}
              containerClassName="space-y-2"
              labelClassName={labelClassName}
              requiredMarkClassName={requiredMarkClassName}
/**
 * defaultInputClassName - Utility function
 * @returns void
 */
              messageClassName={messageClassName}
              descriptionClassName={helperClassName}
              inputClassName={cn(inputClassName, defaultInputClassName)}
              errorInputClassName={errorInputClassName}
/**
 * errorInputClassName - Utility function
 * @returns void
 */
            />

            <BaseInputField
              {...register('contact.lastName')}
              id="checkout-contact-last-name"
              label="Last Name"
              required
              placeholder="Last name"
              maxLength={50}
              errorMessage={errors.contact?.lastName?.message}
              description={`${contact?.lastName?.length ?? 0}/50`}
              containerClassName="space-y-2"
              labelClassName={labelClassName}
              requiredMarkClassName={requiredMarkClassName}
              messageClassName={messageClassName}
              descriptionClassName={helperClassName}
              inputClassName={cn(inputClassName, defaultInputClassName)}
              errorInputClassName={errorInputClassName}
            />
          </div>

          <BaseInputField
            {...register('contact.email')}
            id="checkout-contact-email"
            type="email"
            label="Email Address"
            required
            placeholder="your@email.com"
            errorMessage={errors.contact?.email?.message}
            containerClassName="space-y-2"
            labelClassName={labelClassName}
            requiredMarkClassName={requiredMarkClassName}
            messageClassName={messageClassName}
            inputClassName={cn(inputClassName, defaultInputClassName)}
            errorInputClassName={errorInputClassName}
          />

          <BaseFormField
            id="checkout-contact-phone"
            label="Phone Number"
            required
            errorMessage={errors.contact?.phone?.message}
            description="We will only use your phone number for delivery purposes."
            messageId="checkout-contact-phone-message"
            className="space-y-2"
            labelClassName={labelClassName}
            requiredMarkClassName={requiredMarkClassName}
            messageClassName={messageClassName}
            descriptionClassName={helperClassName}
          >
            <div className="flex gap-2">
              <select
                id="checkout-contact-phone-country-code"
                {...register('contact.phoneCountryCode')}
                className={cn(
                  'h-12 w-25 rounded-xl border bg-white px-3 text-[15px] font-medium text-[#191414] focus:ring-0',
                  defaultInputClassName,
                )}
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
              <BaseInputField
                type="tel"
                {...register('contact.phone')}
                id="checkout-contact-phone"
                label="Phone number input"
                placeholder="000-000-0000"
                aria-describedby="checkout-contact-phone-message"
                errorMessage={errors.contact?.phone?.message}
                containerClassName="flex-1 space-y-0"
                labelClassName="sr-only"
                requiredMarkClassName={requiredMarkClassName}
                messageClassName="sr-only"
                descriptionClassName="sr-only"
                inputClassName={cn(inputClassName, 'flex-1', defaultInputClassName)}
                errorInputClassName={errorInputClassName}
              />
            </div>
          </BaseFormField>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
          Delivery Method
        </h2>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('deliveryMethod', 'pickup', { shouldDirty: true, shouldValidate: true })}
            className={`flex-1 rounded-full border-2 py-3 text-[14px] font-bold transition ${deliveryMethod === 'pickup'
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
            className={`flex-1 rounded-full border-2 py-3 text-[14px] font-bold transition ${deliveryMethod === 'ship_by_platform'
              ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
              : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]'
              }`}
          >
            Ship by Artium
          </button>
        </div>
      </section>

      {deliveryMethod === 'ship_by_platform' && (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
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
