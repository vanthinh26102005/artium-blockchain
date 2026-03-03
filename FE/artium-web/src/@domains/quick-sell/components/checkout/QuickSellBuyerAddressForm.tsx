// react
import { useCallback, useMemo } from 'react'

// @shared - components
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'

// @domains - quick-sell
import type { CheckoutBuyerAddress } from '../../types/checkoutTypes'

type QuickSellBuyerAddressFormProps = {
    address: CheckoutBuyerAddress
    onChange: (address: CheckoutBuyerAddress) => void
    errors?: Record<string, string>
}

// US States for dropdown
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

export const QuickSellBuyerAddressForm = ({
    address,
    onChange,
    errors = {},
}: QuickSellBuyerAddressFormProps) => {
    // -- handlers --
    const handleChange = useCallback(
        (field: keyof CheckoutBuyerAddress, value: string) => {
            onChange({ ...address, [field]: value })
        },
        [address, onChange],
    )

    // -- render helpers --
    const renderField = (
        field: keyof CheckoutBuyerAddress,
        label: string,
        placeholder: string,
        type: string = 'text',
        required: boolean = false,
    ) => {
        const error = errors[field]
        return (
            <div>
                <Label htmlFor={`address-${field}`} className="text-sm font-medium text-slate-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id={`address-${field}`}
                    type={type}
                    value={address[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={placeholder}
                    className={`mt-1 ${error ? 'border-red-500' : ''}`}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        )
    }

    // -- render --
    return (
        <div className="space-y-6">
            {/* Contact Information */}
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

            {/* Shipping Address */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Address</h2>
                <div className="space-y-4">
                    {renderField('addressLine1', 'Address Line 1', '123 Main Street', 'text', true)}
                    {renderField('addressLine2', 'Address Line 2 (Optional)', 'Apt 4B', 'text', false)}

                    <div className="grid grid-cols-2 gap-4">
                        {renderField('city', 'City', 'New York', 'text', true)}
                        <div>
                            <Label htmlFor="address-state" className="text-sm font-medium text-slate-700">
                                State <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="address-state"
                                value={address.state}
                                onChange={(e) => handleChange('state', e.target.value)}
                                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${errors.state ? 'border-red-500' : 'border-slate-300'
                                    }`}
                            >
                                <option value="">Select state</option>
                                {US_STATES.map((state) => (
                                    <option key={state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {renderField('postalCode', 'ZIP Code', '10001', 'text', true)}
                        <div>
                            <Label htmlFor="address-country" className="text-sm font-medium text-slate-700">
                                Country <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="address-country"
                                value={address.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            >
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="GB">United Kingdom</option>
                                <option value="AU">Australia</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Validation helper
export const validateBuyerAddress = (
    address: CheckoutBuyerAddress,
): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!address.firstName.trim()) {
        errors.firstName = 'First name is required'
    }
    if (!address.lastName.trim()) {
        errors.lastName = 'Last name is required'
    }
    if (!address.email.trim()) {
        errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        errors.email = 'Please enter a valid email'
    }
    if (!address.addressLine1.trim()) {
        errors.addressLine1 = 'Address is required'
    }
    if (!address.city.trim()) {
        errors.city = 'City is required'
    }
    if (!address.state.trim()) {
        errors.state = 'State is required'
    }
    if (!address.postalCode.trim()) {
        errors.postalCode = 'ZIP code is required'
    }

    return errors
}
