export const SELLER_AUCTION_DURATION_PRESETS = [
  { value: '24h', label: '24 hours', seconds: 24 * 60 * 60 },
  { value: '3d', label: '3 days', seconds: 3 * 24 * 60 * 60 },
  { value: '7d', label: '7 days', seconds: 7 * 24 * 60 * 60 },
] as const

export type SellerAuctionDurationPresetValue =
  (typeof SELLER_AUCTION_DURATION_PRESETS)[number]['value']

const DEFAULT_SELLER_AUCTION_MIN_DURATION_SECONDS = 24 * 60 * 60
const DEFAULT_SELLER_AUCTION_MAX_DURATION_SECONDS = 30 * 24 * 60 * 60

const parseDurationConfigSeconds = (
  value: string | undefined,
  fallback: number,
): number => {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const SELLER_AUCTION_MIN_DURATION_SECONDS = parseDurationConfigSeconds(
  process.env.NEXT_PUBLIC_SELLER_AUCTION_MIN_DURATION_SECONDS,
  DEFAULT_SELLER_AUCTION_MIN_DURATION_SECONDS,
)

const configuredMaxDurationSeconds = parseDurationConfigSeconds(
  process.env.NEXT_PUBLIC_SELLER_AUCTION_MAX_DURATION_SECONDS,
  DEFAULT_SELLER_AUCTION_MAX_DURATION_SECONDS,
)

export const SELLER_AUCTION_MAX_DURATION_SECONDS =
  configuredMaxDurationSeconds >= SELLER_AUCTION_MIN_DURATION_SECONDS
    ? configuredMaxDurationSeconds
    : DEFAULT_SELLER_AUCTION_MAX_DURATION_SECONDS

export const SELLER_AUCTION_CUSTOM_DURATION_UNITS = [
  { value: 'days', label: 'Days', seconds: 24 * 60 * 60 },
  { value: 'hours', label: 'Hours', seconds: 60 * 60 },
  { value: 'minutes', label: 'Minutes', seconds: 60 },
] as const

export type SellerAuctionCustomDurationUnit =
  (typeof SELLER_AUCTION_CUSTOM_DURATION_UNITS)[number]['value']

export type SellerAuctionTermsFormValues = {
  reservePolicy: 'none' | 'set'
  reservePriceEth: string
  minBidIncrementEth: string
  durationPreset: SellerAuctionDurationPresetValue | 'custom'
  customDurationValue: string
  customDurationUnit: SellerAuctionCustomDurationUnit
  shippingDisclosure: string
  paymentDisclosure: string
  economicsLockedAcknowledged: boolean
}

export const DEFAULT_SELLER_AUCTION_TERMS: SellerAuctionTermsFormValues = {
  reservePolicy: 'none',
  reservePriceEth: '',
  minBidIncrementEth: '',
  durationPreset: '7d',
  customDurationValue: '',
  customDurationUnit: 'hours',
  shippingDisclosure: '',
  paymentDisclosure: '',
  economicsLockedAcknowledged: false,
}

const parseEthAmount = (value: string): number | null => {
  const trimmed = value.trim()

  if (!trimmed || !/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

const parseCustomDurationValue = (value: string): number | null => {
  const trimmed = value.trim()

  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export const isPositiveEthAmount = (value: string): boolean => {
  const parsed = parseEthAmount(value)
  return parsed !== null && parsed > 0
}

const getCustomDurationUnitSeconds = (unit: SellerAuctionCustomDurationUnit): number =>
  SELLER_AUCTION_CUSTOM_DURATION_UNITS.find((option) => option.value === unit)?.seconds ??
  60 * 60

export const getAuctionDurationSeconds = (
  values: SellerAuctionTermsFormValues,
): number | null => {
  if (values.durationPreset === 'custom') {
    const customDurationValue = parseCustomDurationValue(values.customDurationValue)

    if (customDurationValue === null) {
      return null
    }

    return customDurationValue * getCustomDurationUnitSeconds(values.customDurationUnit)
  }

  return (
    SELLER_AUCTION_DURATION_PRESETS.find((preset) => preset.value === values.durationPreset)
      ?.seconds ?? null
  )
}

export const getAuctionDurationHours = (
  values: SellerAuctionTermsFormValues,
): number | null => {
  const durationSeconds = getAuctionDurationSeconds(values)
  return durationSeconds === null ? null : durationSeconds / (60 * 60)
}

export const getMinimumDurationValueForUnit = (
  unit: SellerAuctionCustomDurationUnit,
): number => Math.ceil(SELLER_AUCTION_MIN_DURATION_SECONDS / getCustomDurationUnitSeconds(unit))

export const getMaximumDurationValueForUnit = (
  unit: SellerAuctionCustomDurationUnit,
): number => Math.floor(SELLER_AUCTION_MAX_DURATION_SECONDS / getCustomDurationUnitSeconds(unit))

export const formatAuctionDuration = (durationSeconds: number): string => {
  if (durationSeconds % (24 * 60 * 60) === 0) {
    const days = durationSeconds / (24 * 60 * 60)
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  if (durationSeconds % (60 * 60) === 0) {
    const hours = durationSeconds / (60 * 60)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  const minutes = durationSeconds / 60
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

export const validateSellerAuctionTerms = (
  values: SellerAuctionTermsFormValues,
): Partial<Record<keyof SellerAuctionTermsFormValues, string>> => {
  const errors: Partial<Record<keyof SellerAuctionTermsFormValues, string>> = {}

  const minBidIncrement = values.minBidIncrementEth.trim()
  if (!minBidIncrement) {
    errors.minBidIncrementEth = 'Enter a minimum bid increment.'
  } else {
    const parsedMinBidIncrement = parseEthAmount(minBidIncrement)

    if (parsedMinBidIncrement === null) {
      errors.minBidIncrementEth = 'Enter a valid ETH amount.'
    } else if (parsedMinBidIncrement <= 0) {
      errors.minBidIncrementEth = 'Minimum bid increment must be greater than 0 ETH.'
    }
  }

  if (values.reservePolicy === 'set') {
    const reservePrice = values.reservePriceEth.trim()

    if (!reservePrice) {
      errors.reservePriceEth = 'Enter a reserve price or choose No reserve.'
    } else {
      const parsedReservePrice = parseEthAmount(reservePrice)

      if (parsedReservePrice === null) {
        errors.reservePriceEth = 'Enter a valid ETH amount.'
      } else if (parsedReservePrice <= 0) {
        errors.reservePriceEth = 'Reserve price must be greater than 0 ETH.'
      }
    }
  }

  if (!values.durationPreset) {
    errors.durationPreset = 'Choose an auction duration.'
  } else if (values.durationPreset === 'custom') {
    const customDurationValue = parseCustomDurationValue(values.customDurationValue)
    const customDurationUnit = SELLER_AUCTION_CUSTOM_DURATION_UNITS.some(
      (unit) => unit.value === values.customDurationUnit,
    )

    if (!customDurationUnit) {
      errors.customDurationUnit = 'Choose days, hours, or minutes.'
    } else if (customDurationValue === null) {
      errors.customDurationValue = 'Enter an auction duration.'
    } else {
      const durationSeconds = getAuctionDurationSeconds(values)

      if (durationSeconds === null) {
        errors.customDurationValue = 'Enter an auction duration.'
      } else if (durationSeconds < SELLER_AUCTION_MIN_DURATION_SECONDS) {
        errors.customDurationValue = `Auction duration must be at least ${formatAuctionDuration(
          SELLER_AUCTION_MIN_DURATION_SECONDS,
        )}.`
      } else if (durationSeconds > SELLER_AUCTION_MAX_DURATION_SECONDS) {
        errors.customDurationValue = `Auction duration cannot exceed ${formatAuctionDuration(
          SELLER_AUCTION_MAX_DURATION_SECONDS,
        )}.`
      }
    }
  }

  if (!values.shippingDisclosure.trim()) {
    errors.shippingDisclosure = 'Add shipping and fulfillment notes.'
  }

  if (!values.paymentDisclosure.trim()) {
    errors.paymentDisclosure = 'Add payment and buyer expectations.'
  }

  if (!values.economicsLockedAcknowledged) {
    errors.economicsLockedAcknowledged =
      'Confirm that auction economics lock after activation.'
  }

  return errors
}
