import { useCallback, useMemo } from 'react'
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city'

import {
  BaseAutocompleteField,
  type BaseAutocompleteOption,
} from '@shared/components/forms'
import { Input } from '@shared/components/ui/input'
import { cn } from '@shared/lib/utils'

// --- Types ---

export type AddressData = {
  country: string
  state: string
  city: string
  postalCode: string
  addressLine1: string
  addressLine2: string
}

type AddressFormFieldsProps = {
  value: AddressData
  onChange: (address: AddressData) => void
  disabled?: boolean
  showValidation?: boolean
  errors?: Partial<Record<keyof AddressData, string>>
}

// --- Postal Code Validation Patterns ---

const POSTAL_PATTERNS: Record<string, { regex: RegExp; placeholder: string; maxLength: number }> = {
  US: { regex: /^\d{5}(-\d{4})?$/, placeholder: '12345 or 12345-6789', maxLength: 10 },
  VN: { regex: /^\d{6}$/, placeholder: '100000', maxLength: 6 },
  GB: { regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, placeholder: 'SW1A 1AA', maxLength: 8 },
  JP: { regex: /^\d{3}-\d{4}$/, placeholder: '123-4567', maxLength: 8 },
  CA: { regex: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, placeholder: 'K1A 0B1', maxLength: 7 },
  AU: { regex: /^\d{4}$/, placeholder: '2000', maxLength: 4 },
  DE: { regex: /^\d{5}$/, placeholder: '10115', maxLength: 5 },
  FR: { regex: /^\d{5}$/, placeholder: '75001', maxLength: 5 },
  IN: { regex: /^\d{6}$/, placeholder: '110001', maxLength: 6 },
  BR: { regex: /^\d{5}-?\d{3}$/, placeholder: '01310-100', maxLength: 9 },
  KR: { regex: /^\d{5}$/, placeholder: '06164', maxLength: 5 },
  SG: { regex: /^\d{6}$/, placeholder: '018956', maxLength: 6 },
}

const getPostalConfig = (countryCode: string) => {
  return POSTAL_PATTERNS[countryCode] || { regex: /^.{3,10}$/, placeholder: 'Postal code', maxLength: 10 }
}

// --- Main Component ---

export const AddressFormFields = ({
  value,
  onChange,
  disabled = false,
  showValidation = false,
  errors: externalErrors = {},
}: AddressFormFieldsProps) => {
  // --- Country options ---
  const countryOptions = useMemo<BaseAutocompleteOption[]>(() => {
    return Country.getAllCountries().map((c: ICountry) => ({
      value: c.isoCode,
      label: `${c.flag} ${c.name}`,
      searchTerms: `${c.name} ${c.isoCode}`,
    }))
  }, [])

  // --- State options (based on selected country) ---
  const stateOptions = useMemo<BaseAutocompleteOption[]>(() => {
    if (!value.country) return []
    return State.getStatesOfCountry(value.country).map((s: IState) => ({
      value: s.isoCode,
      label: s.name,
      searchTerms: `${s.name} ${s.isoCode}`,
    }))
  }, [value.country])

  // --- City options (based on selected country + state) ---
  const cityOptions = useMemo<BaseAutocompleteOption[]>(() => {
    if (!value.country) return []
    const cities = value.state
      ? City.getCitiesOfState(value.country, value.state)
      : City.getCitiesOfCountry(value.country) || []
    return cities.map((c: ICity) => ({
      value: c.name,
      label: c.name,
      searchTerms: c.name,
    }))
  }, [value.country, value.state])

  // --- Postal config ---
  const postalConfig = useMemo(() => getPostalConfig(value.country), [value.country])

  // --- Validation ---
  const errors = useMemo(() => {
    const internalErrors: Partial<Record<keyof AddressData, string>> = {}
    if (!showValidation) {
      return {
        ...internalErrors,
        ...externalErrors,
      }
    }
    if (!value.country) internalErrors.country = 'Country is required'
    if (!value.addressLine1) internalErrors.addressLine1 = 'Address is required'
    if (!value.city) internalErrors.city = 'City is required'
    if (!value.postalCode) {
      internalErrors.postalCode = 'Postal code is required'
    } else if (!postalConfig.regex.test(value.postalCode)) {
      internalErrors.postalCode = `Invalid format (e.g., ${postalConfig.placeholder})`
    }
    return {
      ...internalErrors,
      ...externalErrors,
    }
  }, [externalErrors, postalConfig, showValidation, value])

  // --- Handlers ---
  const handleCountryChange = useCallback(
    (country: string) => {
      // Reset dependent fields when country changes
      onChange({
        ...value,
        country,
        state: '',
        city: '',
        postalCode: '',
      })
    },
    [value, onChange],
  )

  const handleStateChange = useCallback(
    (state: string) => {
      // Reset city when state changes
      onChange({
        ...value,
        state,
        city: '',
      })
    },
    [value, onChange],
  )

  const handleFieldChange = useCallback(
    (field: keyof AddressData, fieldValue: string) => {
      onChange({ ...value, [field]: fieldValue })
    },
    [value, onChange],
  )

  return (
    <div className="space-y-5">
      {/* Row 1: Country (full width, first!) */}
      <BaseAutocompleteField
        label="Country"
        required
        options={countryOptions}
        value={value.country}
        onValueChange={handleCountryChange}
        placeholder="Search country..."
        emptyMessage="No countries found"
        disabled={disabled}
        errorMessage={errors.country}
        className="space-y-2"
        labelClassName="text-[11px] font-bold uppercase tracking-wider text-[#989898]"
        requiredMarkClassName="text-red-500"
        inputClassName={cn(
          'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
          errors.country ? 'border-red-500 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#0066FF]',
        )}
        dropdownClassName="absolute z-50 mt-1 max-h-[240px] w-full overflow-auto rounded-xl border border-[#E5E5E5] bg-white shadow-lg"
        optionClassName="w-full px-4 py-3 text-left text-[14px] transition-colors hover:bg-blue-50 text-[#191414]"
        selectedOptionClassName="bg-blue-50 font-medium text-[#0066FF]"
        messageClassName="text-[11px] text-red-500"
      />

      {/* Row 2: State/Province + City */}
      <div className="grid grid-cols-2 gap-4">
        <BaseAutocompleteField
          label="State / Province"
          options={stateOptions}
          value={value.state}
          onValueChange={handleStateChange}
          placeholder={value.country ? 'Search state...' : 'Select country first'}
          emptyMessage="No states found"
          disabled={disabled || !value.country}
          errorMessage={errors.state}
          className="space-y-2"
          labelClassName="text-[11px] font-bold uppercase tracking-wider text-[#989898]"
          requiredMarkClassName="text-red-500"
          inputClassName={cn(
            'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
            errors.state ? 'border-red-500 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#0066FF]',
          )}
          dropdownClassName="absolute z-50 mt-1 max-h-[240px] w-full overflow-auto rounded-xl border border-[#E5E5E5] bg-white shadow-lg"
          optionClassName="w-full px-4 py-3 text-left text-[14px] transition-colors hover:bg-blue-50 text-[#191414]"
          selectedOptionClassName="bg-blue-50 font-medium text-[#0066FF]"
          messageClassName="text-[11px] text-red-500"
        />

        <BaseAutocompleteField
          label="City"
          required
          options={cityOptions}
          value={value.city}
          onValueChange={(city) => handleFieldChange('city', city)}
          placeholder={value.country ? 'Search city...' : 'Select country first'}
          emptyMessage="No cities found"
          disabled={disabled || !value.country}
          errorMessage={errors.city}
          className="space-y-2"
          labelClassName="text-[11px] font-bold uppercase tracking-wider text-[#989898]"
          requiredMarkClassName="text-red-500"
          inputClassName={cn(
            'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
            errors.city ? 'border-red-500 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#0066FF]',
          )}
          dropdownClassName="absolute z-50 mt-1 max-h-[240px] w-full overflow-auto rounded-xl border border-[#E5E5E5] bg-white shadow-lg"
          optionClassName="w-full px-4 py-3 text-left text-[14px] transition-colors hover:bg-blue-50 text-[#191414]"
          selectedOptionClassName="bg-blue-50 font-medium text-[#0066FF]"
          messageClassName="text-[11px] text-red-500"
        />
      </div>

      {/* Row 3: Address Line 1 */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <Input
          value={value.addressLine1}
          onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
          placeholder="Street address, P.O. Box"
          disabled={disabled}
          className={cn(
            'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
            errors.addressLine1 ? 'border-red-500 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#0066FF]',
          )}
        />
        {errors.addressLine1 && <span className="text-[11px] text-red-500">{errors.addressLine1}</span>}
      </div>

      {/* Row 4: Address Line 2 */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          Address Line 2 <span className="text-[#989898]">(optional)</span>
        </label>
        <Input
          value={value.addressLine2}
          onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
          placeholder="Apartment, suite, unit, building, floor"
          disabled={disabled}
          className="h-12 rounded-xl border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
        />
      </div>

      {/* Row 5: Postal Code */}
      <div className="w-1/2 space-y-2 pr-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
          Postal / ZIP Code <span className="text-red-500">*</span>
        </label>
        <Input
          value={value.postalCode}
          onChange={(e) => handleFieldChange('postalCode', e.target.value.slice(0, postalConfig.maxLength))}
          placeholder={postalConfig.placeholder}
          disabled={disabled}
          maxLength={postalConfig.maxLength}
          className={cn(
            'h-12 rounded-xl border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0',
            errors.postalCode ? 'border-red-500 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#0066FF]',
          )}
        />
        {errors.postalCode && <span className="text-[11px] text-red-500">{errors.postalCode}</span>}
      </div>
    </div>
  )
}

export default AddressFormFields
