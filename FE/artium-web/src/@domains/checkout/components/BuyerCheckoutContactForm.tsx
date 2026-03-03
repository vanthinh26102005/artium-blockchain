// react
import { useCallback } from 'react'

// shared
import { Input } from '@shared/components/ui/input'

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

export const BuyerCheckoutContactForm = ({
    contact,
    deliveryMethod,
    shippingAddress,
    onContactChange,
    onDeliveryMethodChange,
    onShippingAddressChange,
}: BuyerCheckoutContactFormProps) => {

    const handleContactField = useCallback((field: keyof BuyerContactInfo, value: string) => {
        onContactChange({ ...contact, [field]: value })
    }, [contact, onContactChange])

    const handleAddressField = useCallback((field: keyof BuyerShippingAddress, value: string) => {
        onShippingAddressChange({ ...shippingAddress, [field]: value })
    }, [shippingAddress, onShippingAddressChange])

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
                                placeholder="First name"
                                className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                            />
                            <span className="text-[11px] text-[#989898]">{contact.firstName.length}/50 characters</span>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={contact.lastName}
                                onChange={(e) => handleContactField('lastName', e.target.value)}
                                placeholder="Last name"
                                className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                            />
                            <span className="text-[11px] text-[#989898]">{contact.lastName.length}/50 characters</span>
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
                            placeholder="your@email.com"
                            className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                        />
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
                            </select>
                            <Input
                                type="tel"
                                value={contact.phone}
                                onChange={(e) => handleContactField('phone', e.target.value)}
                                placeholder="000-000-0000"
                                className="h-[48px] flex-1 rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                            />
                        </div>
                        <span className="text-[11px] text-[#989898]">We will only use your phone number for delivery purposes.</span>
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

            {/* Shipping Address */}
            {deliveryMethod === 'ship_by_platform' && (
                <section className="rounded-[24px] bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-[13px] font-bold uppercase tracking-wider text-[#191414]">
                        Shipping Address
                    </h2>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Address Line 1 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={shippingAddress.addressLine1}
                                onChange={(e) => handleAddressField('addressLine1', e.target.value)}
                                placeholder="Street address"
                                className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                Address Line 2 (optional)
                            </label>
                            <Input
                                value={shippingAddress.addressLine2}
                                onChange={(e) => handleAddressField('addressLine2', e.target.value)}
                                placeholder="Apartment, suite, etc."
                                className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={shippingAddress.city}
                                    onChange={(e) => handleAddressField('city', e.target.value)}
                                    placeholder="City"
                                    className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                    State / Province <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={shippingAddress.state}
                                    onChange={(e) => handleAddressField('state', e.target.value)}
                                    placeholder="State"
                                    className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                    Postal Code <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => handleAddressField('postalCode', e.target.value)}
                                    placeholder="12345"
                                    className="h-[48px] rounded-[12px] border border-[#E5E5E5] bg-white text-[15px] font-medium text-[#191414] placeholder:text-[#989898] focus:border-[#0066FF] focus:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#989898]">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={shippingAddress.country}
                                    onChange={(e) => handleAddressField('country', e.target.value)}
                                    className="h-[48px] w-full rounded-[12px] border border-[#E5E5E5] bg-white px-4 text-[15px] font-medium text-[#191414] focus:border-[#0066FF] focus:ring-0"
                                >
                                    <option value="US">United States</option>
                                    <option value="VN">Vietnam</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="JP">Japan</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
