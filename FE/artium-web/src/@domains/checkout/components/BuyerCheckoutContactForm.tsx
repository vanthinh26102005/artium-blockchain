// react
import { useCallback, useMemo, useState } from 'react'

// shared
import { Input } from '@shared/components/ui/input'
import { AddressFormFields, type AddressData } from '@shared/components/address'

// types
import type { BuyerContactInfo, BuyerShippingAddress, DeliveryMethod } from '../types/buyerCheckoutTypes'

type BuyerCheckoutContactFormProps = {
    contact: BuyerContactInfo
    deliveryMethod: DeliveryMethod
    shippingAddress: BuyerShippingAddress
    onContactChange: (contact: BuyerContactInfo) => void
    onDeliveryMethodChange: (method: DeliveryMethod) => void
    onShippingAddressChange: (address: BuyerShippingAddress) => void
}

// --- Contact Validation ---

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s\-()]+$/

type ContactErrors = {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
}

const validateContact = (contact: BuyerContactInfo): ContactErrors => {
    const errors: ContactErrors = {}
    if (!contact.firstName.trim()) errors.firstName = 'First name is required'
    else if (contact.firstName.length > 50) errors.firstName = 'Max 50 characters'
    
    if (!contact.lastName.trim()) errors.lastName = 'Last name is required'
    else if (contact.lastName.length > 50) errors.lastName = 'Max 50 characters'
    
    if (!contact.email.trim()) errors.email = 'Email is required'
    else if (!EMAIL_REGEX.test(contact.email)) errors.email = 'Invalid email format'
    
    if (!contact.phone.trim()) errors.phone = 'Phone number is required'
    else if (!PHONE_REGEX.test(contact.phone)) errors.phone = 'Invalid phone format'
    else if (contact.phone.replace(/\D/g, '').length < 7) errors.phone = 'Phone number too short'
    
    return errors
}

export const BuyerCheckoutContactForm = ({
    contact,
    deliveryMethod,
    shippingAddress,
    onContactChange,
    onDeliveryMethodChange,
    onShippingAddressChange,
}: BuyerCheckoutContactFormProps) => {
    const [showContactErrors, setShowContactErrors] = useState(false)
    const [showAddressErrors, setShowAddressErrors] = useState(false)

    const contactErrors = useMemo(() => validateContact(contact), [contact])

    const handleContactField = useCallback((field: keyof BuyerContactInfo, value: string) => {
        onContactChange({ ...contact, [field]: value })
    }, [contact, onContactChange])

    const handleContactBlur = useCallback(() => {
        setShowContactErrors(true)
    }, [])

    // Convert AddressData to BuyerShippingAddress format
    const addressData: AddressData = useMemo(() => ({
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
    }), [shippingAddress])

    const handleAddressChange = useCallback((address: AddressData) => {
        setShowAddressErrors(true)
        onShippingAddressChange({
            country: address.country,
            state: address.state,
            city: address.city,
            postalCode: address.postalCode,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
        })
    }, [onShippingAddressChange])

    return (
        <div className="space-y-8">
            {/* Contact Information */}
            <section className="rounded-[24px] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
                    Contact Information
                </h2>

                <div className="space-y-5">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={contact.firstName}
                                onChange={(e) => handleContactField('firstName', e.target.value)}
                                onBlur={handleContactBlur}
                                placeholder="First name"
                                maxLength={50}
                                className={`h-[48px] rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0 ${
                                    showContactErrors && contactErrors.firstName
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-[#E5E5E5] focus:border-[#0066FF]'
                                }`}
                            />
                            <div className="flex justify-between">
                                {showContactErrors && contactErrors.firstName ? (
                                    <span className="text-[11px] text-red-500">{contactErrors.firstName}</span>
                                ) : (
                                    <span className="text-[11px] text-[#989898]">{contact.firstName.length}/50</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={contact.lastName}
                                onChange={(e) => handleContactField('lastName', e.target.value)}
                                onBlur={handleContactBlur}
                                placeholder="Last name"
                                maxLength={50}
                                className={`h-[48px] rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0 ${
                                    showContactErrors && contactErrors.lastName
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-[#E5E5E5] focus:border-[#0066FF]'
                                }`}
                            />
                            <div className="flex justify-between">
                                {showContactErrors && contactErrors.lastName ? (
                                    <span className="text-[11px] text-red-500">{contactErrors.lastName}</span>
                                ) : (
                                    <span className="text-[11px] text-[#989898]">{contact.lastName.length}/50</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleContactField('email', e.target.value)}
                            onBlur={handleContactBlur}
                            placeholder="your@email.com"
                            className={`h-[48px] rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0 ${
                                showContactErrors && contactErrors.email
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-[#E5E5E5] focus:border-[#0066FF]'
                            }`}
                        />
                        {showContactErrors && contactErrors.email && (
                            <span className="text-[11px] text-red-500">{contactErrors.email}</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={contact.phoneCountryCode}
                                onChange={(e) => handleContactField('phoneCountryCode', e.target.value)}
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
                                value={contact.phone}
                                onChange={(e) => handleContactField('phone', e.target.value)}
                                onBlur={handleContactBlur}
                                placeholder="000-000-0000"
                                className={`h-[48px] flex-1 rounded-[12px] border bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:ring-0 ${
                                    showContactErrors && contactErrors.phone
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-[#E5E5E5] focus:border-[#0066FF]'
                                }`}
                            />
                        </div>
                        {showContactErrors && contactErrors.phone ? (
                            <span className="text-[11px] text-red-500">{contactErrors.phone}</span>
                        ) : (
                            <span className="text-[11px] text-[#989898]">We will only use your phone number for delivery purposes.</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Delivery Method */}
            <section className="rounded-[24px] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
                    Delivery Method
                </h2>

                <div className="flex gap-3">
                    <button
                        onClick={() => onDeliveryMethodChange('pickup')}
                        className={`flex-1 rounded-full border-2 py-3 text-[14px] font-bold transition ${deliveryMethod === 'pickup'
                                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                                : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]'
                            }`}
                    >
                        Pick up / Ship by seller
                    </button>
                    <button
                        onClick={() => onDeliveryMethodChange('ship_by_platform')}
                        className={`flex-1 rounded-full border-2 py-3 text-[14px] font-bold transition ${deliveryMethod === 'ship_by_platform'
                                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                                : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]'
                            }`}
                    >
                        Ship by Artium
                    </button>
                </div>
            </section>

            {/* Shipping Address — Enhanced with country-state-city dropdowns */}
            {deliveryMethod === 'ship_by_platform' && (
                <section className="rounded-[24px] bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
                        Shipping Address
                    </h2>

                    <AddressFormFields
                        value={addressData}
                        onChange={handleAddressChange}
                        showValidation={showAddressErrors}
                    />
                </section>
            )}
        </div>
    )
}
