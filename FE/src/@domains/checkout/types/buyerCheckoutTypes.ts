// Buyer Checkout Types
// For direct artwork purchase flow from Discover

export type DeliveryMethod = 'pickup' | 'ship_by_seller' | 'ship_by_platform'

export type BuyerContactInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  phoneCountryCode: string
}

export type BuyerShippingAddress = {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type BuyerCheckoutDraft = {
  contact: BuyerContactInfo
  deliveryMethod: DeliveryMethod
  shippingAddress: BuyerShippingAddress
  promoCode: string
}

export type ArtworkForCheckout = {
  id: string
  title: string
  artistName: string
  artistId?: string
  price: number
  priceLabel: string
  coverUrl: string
  medium?: string
  dimensions?: string
}

export type CheckoutPricing = {
  artworkPrice: number
  shippingFee: number
  discount: number
  total: number
}

// Default values
export const defaultBuyerContactInfo: BuyerContactInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phoneCountryCode: '+1',
}

export const defaultShippingAddress: BuyerShippingAddress = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
}

export const defaultBuyerCheckoutDraft: BuyerCheckoutDraft = {
  contact: defaultBuyerContactInfo,
  deliveryMethod: 'ship_by_platform',
  shippingAddress: defaultShippingAddress,
  promoCode: '',
}
