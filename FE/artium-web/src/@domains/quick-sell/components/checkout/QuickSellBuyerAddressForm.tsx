import { type FieldPath, useFormContext, useWatch } from 'react-hook-form'

import { BaseFormField, BaseInputField } from '@shared/components/forms'

import type { CheckoutBuyerAddress } from '../../types/checkoutTypes'
import { quickSellCheckoutAddressSchema, type QuickSellCheckoutFormValues } from '../../validations/quickSellCheckout.schema'

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'Washington DC' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

export const QuickSellBuyerAddressForm = () => {
  const {
    formState,
    getFieldState,
    register,
  } = useFormContext<QuickSellCheckoutFormValues>()
  const address = useWatch({ name: 'address' })
  const labelClassName = 'text-sm font-medium text-slate-700'
  const messageClassName = 'text-xs text-red-500'

  const getError = (name: FieldPath<QuickSellCheckoutFormValues>) =>
    getFieldState(name, formState).error?.message

  const renderField = (
    field: keyof CheckoutBuyerAddress,
    label: string,
    placeholder: string,
    type = 'text',
    required = false,
  ) => {
    const name = `address.${field}` as const
    const error = getError(name)

    return (
      <BaseInputField
        id={`address-${field}`}
        type={type}
        label={label}
        required={required}
        {...register(name)}
        value={address?.[field] ?? ''}
        placeholder={placeholder}
        errorMessage={error}
        containerClassName="space-y-1"
        labelClassName={labelClassName}
        requiredMarkClassName="text-red-500"
        messageClassName={messageClassName}
        errorInputClassName="border-red-500"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {renderField('firstName', 'First Name', 'John', 'text', true)}
            {renderField('lastName', 'Last Name', 'Doe', 'text', true)}
          </div>
          {renderField('email', 'Email', 'john@example.com', 'email', true)}
          {renderField('phone', 'Phone', '+1 (555) 123-4567', 'tel', false)}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Address</h2>
        <div className="space-y-4">
          {renderField('addressLine1', 'Address Line 1', '123 Main Street', 'text', true)}
          {renderField('addressLine2', 'Address Line 2 (Optional)', 'Apt 4B')}

          <div className="grid grid-cols-2 gap-4">
            {renderField('city', 'City', 'New York', 'text', true)}
            <BaseFormField
              id="address-state"
              label="State"
              required
              errorMessage={getError('address.state')}
              className="space-y-1"
              labelClassName={labelClassName}
              requiredMarkClassName="text-red-500"
              messageClassName={messageClassName}
            >
              <select
                id="address-state"
                {...register('address.state')}
                value={address?.state ?? ''}
                aria-invalid={Boolean(getError('address.state'))}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  getError('address.state') ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select state</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </BaseFormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {renderField('postalCode', 'ZIP Code', '10001', 'text', true)}
            <BaseFormField
              id="address-country"
              label="Country"
              required
              errorMessage={getError('address.country')}
              className="space-y-1"
              labelClassName={labelClassName}
              requiredMarkClassName="text-red-500"
              messageClassName={messageClassName}
            >
              <select
                id="address-country"
                {...register('address.country')}
                value={address?.country ?? ''}
                aria-invalid={Boolean(getError('address.country'))}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  getError('address.country') ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </BaseFormField>
          </div>
        </div>
      </div>
    </div>
  )
}

export const validateBuyerAddress = (
  address: CheckoutBuyerAddress,
): Record<string, string> => {
  const result = quickSellCheckoutAddressSchema.safeParse(address)

  if (result.success) {
    return {}
  }

  return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
    const field = issue.path.join('.')
    acc[field] = issue.message
    return acc
  }, {})
}
