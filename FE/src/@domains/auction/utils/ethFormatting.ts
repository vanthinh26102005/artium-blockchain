const DEFAULT_ETH_FRACTION_DIGITS = 6
const DEFAULT_ETH_INPUT_FRACTION_DIGITS = 18

export const normalizeAuctionEthValue = (
  value: number,
  fractionDigits = DEFAULT_ETH_FRACTION_DIGITS,
) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Number(value.toFixed(fractionDigits))
}

export const formatAuctionEthValue = (
  value: number,
  maximumFractionDigits = DEFAULT_ETH_FRACTION_DIGITS,
) => {
  if (!Number.isFinite(value)) {
    return '0'
  }

  const normalizedValue = Object.is(value, -0) ? 0 : value

  return normalizedValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

export const formatAuctionEth = (
  value: number,
  maximumFractionDigits = DEFAULT_ETH_FRACTION_DIGITS,
) => `${formatAuctionEthValue(value, maximumFractionDigits)} ETH`

export const formatAuctionEthInputValue = (
  value: number,
  maximumFractionDigits = DEFAULT_ETH_INPUT_FRACTION_DIGITS,
) => {
  if (!Number.isFinite(value)) {
    return ''
  }

  return value.toFixed(maximumFractionDigits).replace(/\.?0+$/, '')
}
